<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card class="auth-card">
      <q-card-section class="row items-center">
        <div class="text-h5 col">{{ t('app.title') }}</div>
        <q-btn
          flat
          dense
          :label="locale === 'es' ? 'EN' : 'ES'"
          :aria-label="t('language.label')"
          @click="setLanguage(locale === 'es' ? 'en' : 'es')"
        />
      </q-card-section>

      <q-card-section>
        <div class="text-h6">{{ isSetup ? t('auth.setupTitle') : t('auth.loginTitle') }}</div>
        <div class="text-body2 text-grey-7 q-mt-sm">
          {{ isSetup ? t('auth.setupDescription') : t('auth.loginDescription') }}
        </div>
      </q-card-section>

      <q-banner v-if="statusError" class="bg-orange-1 text-orange-10 q-mx-md q-mb-md" rounded>
        {{ statusError }}
      </q-banner>

      <q-form v-if="!qrCode && isSetup && authReady" class="q-px-md q-pb-md" @submit.prevent="startSetup">
        <q-input
          v-model="email"
          type="email"
          autocomplete="username"
          outlined
          class="q-mb-sm"
          :label="t('auth.email')"
          required
        />
        <q-input
          v-model="password"
          type="password"
          autocomplete="new-password"
          outlined
          class="q-mb-sm"
          :label="t('auth.password')"
          :hint="t('auth.passwordHelp')"
          minlength="12"
          required
        />
        <q-input
          v-model="setupToken"
          type="password"
          autocomplete="off"
          outlined
          class="q-mb-sm"
          :label="t('auth.setupToken')"
          required
        />
        <div class="text-caption text-grey-7 q-mb-md">{{ t('auth.setupTokenHelp') }}</div>
        <q-btn
          type="submit"
          color="primary"
          unelevated
          class="full-width"
          :label="t('auth.setupAccount')"
          :loading="loading"
        />
      </q-form>

      <q-form v-else-if="qrCode" class="q-px-md q-pb-md" @submit.prevent="verifySetup">
        <div class="text-body2 q-mb-md">{{ t('auth.scanQr') }}</div>
        <div class="text-center q-mb-md">
          <img class="qr-image" :src="qrCode" :alt="t('auth.qrAlt')" />
        </div>
        <div class="text-caption text-grey-7 q-mb-md">{{ t('auth.manualSecret') }}</div>
        <q-input
          :model-value="manualKey"
          readonly
          outlined
          class="q-mb-md"
          :label="t('auth.manualSecretLabel')"
        />
        <q-input
          v-model="code"
          inputmode="numeric"
          autocomplete="one-time-code"
          outlined
          maxlength="6"
          :label="t('auth.otp')"
          required
        />
        <q-btn
          type="submit"
          color="primary"
          unelevated
          class="full-width q-mt-md"
          :label="t('auth.confirmCode')"
          :loading="loading"
        />
      </q-form>

      <q-form v-else-if="!isSetup && authReady" class="q-px-md q-pb-md" @submit.prevent="signIn">
        <q-input
          v-model="email"
          type="email"
          autocomplete="username"
          outlined
          class="q-mb-sm"
          :label="t('auth.email')"
          required
        />
        <q-input
          v-model="password"
          type="password"
          autocomplete="current-password"
          outlined
          class="q-mb-sm"
          :label="t('auth.password')"
          required
        />
        <q-input
          v-model="code"
          inputmode="numeric"
          autocomplete="one-time-code"
          outlined
          maxlength="6"
          :label="t('auth.otp')"
          required
        />
        <q-btn
          type="submit"
          color="primary"
          unelevated
          class="full-width q-mt-md"
          :label="t('auth.signIn')"
          :loading="loading"
        />
      </q-form>

      <q-card-section v-if="authReady" class="text-caption text-grey-7">
        {{ t('auth.secureNote') }}
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import authService from '@/services/authService'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const { locale, setLanguage, t } = useI18n()
const email = ref('')
const password = ref('')
const setupToken = ref('')
const code = ref('')
const qrCode = ref('')
const manualKey = ref('')
const isSetup = ref(false)
const authReady = ref(false)
const loading = ref(false)
const statusError = ref('')

async function loadStatus() {
  try {
    const { data } = await authService.status()
    authReady.value = data.authReady
    isSetup.value = data.setupRequired
    if (!authReady.value) statusError.value = t('auth.configMissing')
  } catch (error) {
    statusError.value = error.response?.status === 503
      ? t('auth.configMissing')
      : t('auth.loadError')
  }
}

async function startSetup() {
  loading.value = true
  statusError.value = ''
  try {
    const { data } = await authService.startSetup({
      email: email.value,
      password: password.value,
      setupToken: setupToken.value
    })
    qrCode.value = data.qrCode
    manualKey.value = data.manualKey
    $q.notify({ type: 'positive', message: t('auth.setupStarted'), position: 'top' })
  } catch (error) {
    statusError.value = t('auth.setupFailed')
  } finally {
    loading.value = false
  }
}

async function verifySetup() {
  if (!/^\d{6}$/.test(code.value)) {
    statusError.value = t('auth.invalidCode')
    return
  }
  loading.value = true
  statusError.value = ''
  try {
    await authStore.finishSetup(code.value)
    manualKey.value = ''
    qrCode.value = ''
    await router.replace('/')
  } catch (error) {
    statusError.value = t('auth.setupFailed')
  } finally {
    loading.value = false
  }
}

async function signIn() {
  if (!/^\d{6}$/.test(code.value)) {
    statusError.value = t('auth.invalidCode')
    return
  }
  loading.value = true
  statusError.value = ''
  try {
    await authStore.login({ email: email.value, password: password.value, code: code.value })
    await router.replace('/')
  } catch (error) {
    statusError.value = t('auth.loginFailed')
  } finally {
    loading.value = false
  }
}

onMounted(loadStatus)
</script>

<style scoped lang="scss">
.auth-card {
  width: 100%;
  max-width: 440px;
}

.qr-image {
  width: 220px;
  height: 220px;
}
</style>
