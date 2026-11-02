param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE 'Documents\apitax-backups'),
  [string]$MongoContainer = 'apitax-mongodb',
  [string]$BackendContainer = 'apitax-backend',
  [string]$Database = 'apitax',
  [string]$UploadDirectory = '/app/uploads',
  [string]$LocalUploadDirectory = (Join-Path $PSScriptRoot '..\backend\uploads')
)

$ErrorActionPreference = 'Stop'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$backupDirectory = Join-Path $BackupRoot "$Database-$timestamp"
$receiptBackupDirectory = Join-Path $backupDirectory 'uploads'
$archiveName = "$Database-$timestamp.archive.gz"
$remoteArchive = "/tmp/$archiveName"
$localArchive = Join-Path $backupDirectory $archiveName

New-Item -ItemType Directory -Path $receiptBackupDirectory -Force | Out-Null

try {
  $isRunning = docker inspect --format '{{.State.Running}}' $MongoContainer
  if ($LASTEXITCODE -ne 0 -or $isRunning.Trim() -ne 'true') {
    throw "El contenedor MongoDB '$MongoContainer' no está ejecutándose."
  }

  docker exec $MongoContainer mongodump --db $Database --archive=$remoteArchive --gzip
  if ($LASTEXITCODE -ne 0) {
    throw 'mongodump falló; revisa el contenedor y los registros.'
  }

  docker cp "${MongoContainer}:$remoteArchive" $localArchive
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $localArchive)) {
    throw 'No se pudo copiar el archivo de respaldo de MongoDB al equipo.'
  }

  $backendContainerExists = docker inspect --format '{{.Name}}' $BackendContainer 2>$null
  if ($LASTEXITCODE -eq 0) {
    # docker cp también puede leer el volumen montado si el contenedor está detenido.
    docker cp "${BackendContainer}:$UploadDirectory/." $receiptBackupDirectory
    if ($LASTEXITCODE -ne 0) {
      throw 'No se pudieron copiar los recibos del volumen Docker al respaldo.'
    }
    $receiptSource = "$BackendContainer`:$UploadDirectory"
  } else {
    # En desarrollo manual, el backend guarda los recibos en backend/uploads del proyecto.
    $resolvedUploads = (Resolve-Path -LiteralPath $LocalUploadDirectory).Path
    $localReceiptFiles = @(Get-ChildItem -LiteralPath $resolvedUploads -Force)
    foreach ($file in $localReceiptFiles) {
      Copy-Item -LiteralPath $file.FullName -Destination $receiptBackupDirectory -Recurse -Force
    }
    $receiptSource = $resolvedUploads
  }

  $receiptFiles = @(Get-ChildItem -LiteralPath $receiptBackupDirectory -Force)

  $manifest = [ordered]@{
    createdAt = (Get-Date).ToString('o')
    database = $Database
    mongoArchive = $archiveName
    receiptDirectory = 'uploads'
    receiptFileCount = $receiptFiles.Count
    sourceUploadDirectory = $receiptSource
  }
  $manifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $backupDirectory 'manifest.json') -Encoding UTF8

  Write-Output "Respaldo MongoDB: $localArchive"
  Write-Output "Respaldo de recibos: $receiptBackupDirectory ($($receiptFiles.Count) elementos)"
  Write-Output 'Guarda la carpeta de respaldo en un disco seguro separado del equipo y del repositorio.'
} finally {
  docker exec $MongoContainer rm -f $remoteArchive 2>$null | Out-Null
}
