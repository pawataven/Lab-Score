<script setup lang="ts">
type SubmissionRecord = {
  id: string
  name: string
  email: string | null
  message: string
  source: string
  status: string
  createdAt: string
}

const config = useRuntimeConfig()

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const pending = ref(false)
const latestSubmission = ref<SubmissionRecord | null>(null)
const errorMessage = ref('')
const successMessage = ref('')

async function submitForm() {
  pending.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const created = await $fetch<SubmissionRecord>(`${config.public.apiBase}/test-submissions`, {
      method: 'POST',
      body: {
        ...form,
        source: 'nuxt-backend-test-page',
      },
    })

    latestSubmission.value = created
    successMessage.value = `Saved successfully: ${created.name}`
    form.name = ''
    form.email = ''
    form.message = ''
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Failed to send data to backend'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-3 border-b border-slate-200 pb-5">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Backend Test</p>
        <h1 class="text-3xl font-semibold text-slate-900">Send data from frontend to backend</h1>
        <p class="max-w-2xl text-sm text-slate-600">
          This page submits a record to NestJS and shows the record returned by the API after it is stored in PostgreSQL.
        </p>
      </div>

      <div class="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form class="space-y-4" @submit.prevent="submitForm">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              maxlength="120"
              class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
              placeholder="Pawat"
            >
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              v-model="form.email"
              type="email"
              maxlength="254"
              class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
              placeholder="optional@example.com"
            >
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Message</label>
            <textarea
              v-model="form.message"
              required
              rows="5"
              maxlength="4000"
              class="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500"
              placeholder="Test the backend save flow"
            />
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              :disabled="pending"
              class="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {{ pending ? 'Saving...' : 'Send to backend' }}
            </button>
          </div>

          <p v-if="successMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {{ successMessage }}
          </p>

          <p v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ errorMessage }}
          </p>
        </form>

        <div class="rounded-3xl bg-slate-50 p-5">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Latest saved record</h2>
              <p class="text-sm text-slate-500">This shows the object returned by the API after persistence.</p>
            </div>
            <span class="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
              {{ latestSubmission ? '1 record' : '0 records' }}
            </span>
          </div>

          <div v-if="!latestSubmission" class="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
            Submit the form to verify the database write path.
          </div>

          <div v-else class="rounded-2xl border border-slate-200 bg-white p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-slate-900">{{ latestSubmission.name }}</p>
                <p class="text-xs text-slate-500">{{ latestSubmission.email || 'no-email' }}</p>
              </div>
              <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {{ latestSubmission.status }}
              </span>
            </div>
            <p class="mt-3 text-sm text-slate-700">{{ latestSubmission.message }}</p>
            <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>source: {{ latestSubmission.source }}</span>
              <span>created: {{ new Date(latestSubmission.createdAt).toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
