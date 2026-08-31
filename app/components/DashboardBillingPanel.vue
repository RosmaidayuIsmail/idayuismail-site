<template>
  <div>
    <div v-if="loading" class="py-8"><PageSkeleton variant="page" /></div>

    <div v-else-if="!wedding" class="text-center text-white/60 py-20">
      <p>You haven't created your wedding card yet.</p>
      <UButton to="/dashboard" class="mt-4">Go create it</UButton>
    </div>

    <div v-else class="space-y-8 max-w-4xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-gold-100">Billing &amp; Plan</h1>
          <p class="text-sm text-white/60 mt-1 flex items-center gap-2">
            Current plan:
            <UBadge :color="wedding.plan === 'premium' ? 'primary' : 'neutral'" variant="subtle">{{ wedding.plan === 'premium' ? 'Premium' : 'Free' }}</UBadge>
            <UBadge v-if="wedding.plan === 'premium'" :color="wedding.paymentStatus === 'paid' ? 'success' : 'warning'" variant="subtle">
              {{ paymentStatusLabel }}
            </UBadge>
          </p>
        </div>
        <UButton
          v-if="wedding.plan !== 'premium' && isOwnWedding"
          color="primary"
          size="lg"
          class="font-semibold shadow-lg shadow-gold-500/20"
          icon="i-heroicons-credit-card"
          @click="openPayModal"
        >
          Upgrade with ToyyibPay
        </UButton>
      </div>

      <!-- Payment return banner: shown while we verify a payment the couple
           just made on ToyyibPay. The ?payment=return query arrives with
           status_id/billcode/order_id appended by ToyyibPay itself. -->
      <div v-if="paymentReturn !== 'idle'" class="payment-banner" :class="`payment-banner-${paymentReturn}`">
        <div class="flex items-start gap-3">
          <UIcon v-if="paymentReturn === 'verifying'" name="i-heroicons-arrow-path" class="w-6 h-6 shrink-0 mt-0.5 animate-spin text-amber-300" />
          <UIcon v-else-if="paymentReturn === 'paid'" name="i-heroicons-check-circle" class="w-6 h-6 shrink-0 mt-0.5 text-emerald-400" />
          <UIcon v-else-if="paymentReturn === 'failed'" name="i-heroicons-x-circle" class="w-6 h-6 shrink-0 mt-0.5 text-rose-400" />
          <UIcon v-else name="i-heroicons-clock" class="w-6 h-6 shrink-0 mt-0.5 text-amber-300" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-white">
              <template v-if="paymentReturn === 'verifying'">Verifying your payment...</template>
              <template v-else-if="paymentReturn === 'paid'">Payment successful — Premium is yours!</template>
              <template v-else-if="paymentReturn === 'failed'">Payment was not completed</template>
              <template v-else>Still confirming your payment</template>
            </p>
            <p class="text-sm text-white/60 mt-1">
              <template v-if="paymentReturn === 'verifying'">Checking with ToyyibPay — this usually takes a few seconds.</template>
              <template v-else-if="paymentReturn === 'paid'">Every premium theme is now unlocked for your card. Thank you!</template>
              <template v-else-if="paymentReturn === 'failed'">No charge was made. You can try again whenever you're ready.</template>
              <template v-else>ToyyibPay hasn't confirmed it yet. If you paid, this usually resolves itself within a minute.</template>
            </p>
            <div v-if="paymentReturn === 'timeout'" class="mt-3">
              <UButton size="sm" color="primary" variant="soft" :loading="rechecking" @click="checkPaymentOnce">Check again</UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Premium already active -->
      <UAlert
        v-if="wedding.plan === 'premium'"
        icon="i-heroicons-sparkles"
        color="success"
        variant="soft"
        title="You're on Premium"
        description="Every premium theme is unlocked for your card. Thank you for supporting WeddingCard!"
      />

      <!-- Pending manual request status -->
      <div v-else-if="pendingRequest" class="pending-card">
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-clock" class="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-white">Your manual upgrade request is being reviewed</p>
            <p class="text-sm text-white/60 mt-1">
              Submitted {{ formatDate(pendingRequest.createdAt) }}<span v-if="pendingRequest.themeName"> · interested in <span class="text-gold-200">{{ pendingRequest.themeName }}</span></span>
            </p>
            <p v-if="pendingRequest.note" class="text-sm text-white/50 mt-2 italic">"{{ pendingRequest.note }}"</p>
            <p class="text-xs text-white/40 mt-3">We'll reach out to arrange payment, then activate Premium on your card - no need to submit again.</p>
          </div>
        </div>
      </div>

      <!-- How payment works -->
      <UAlert
        v-if="wedding.plan !== 'premium' && isOwnWedding"
        icon="i-heroicons-information-circle"
        color="info"
        variant="soft"
        title="How upgrading works"
        description="Pay securely with FPX online banking through ToyyibPay. Premium unlocks the moment your payment is confirmed — usually within seconds. Prefer to arrange payment another way? Use the manual request option at the bottom of this page."
      />

      <!-- Feature comparison -->
      <div>
        <h2 class="font-display text-lg mb-3">Compare plans</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="plan-card">
            <p class="font-display text-lg">Free</p>
            <p class="text-2xl font-bold mt-1">RM 0</p>
            <ul class="mt-4 space-y-2 text-sm text-white/70">
              <li v-for="feature in freeFeatures" :key="feature" class="flex items-start gap-2">
                <UIcon name="i-heroicons-check" class="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" /> {{ feature }}
              </li>
            </ul>
            <UButton block variant="soft" color="neutral" class="mt-5" disabled>
              {{ wedding.plan === 'free' ? 'Current plan' : 'Included' }}
            </UButton>
          </div>

          <div class="plan-card plan-card-highlight">
            <div class="flex items-center gap-2">
              <p class="font-display text-lg text-gold-200">Premium</p>
              <UBadge color="primary" variant="subtle" size="sm">Most popular</UBadge>
            </div>
            <p class="text-2xl font-bold mt-1">From RM {{ cheapestPremiumPrice }}</p>
            <ul class="mt-4 space-y-2 text-sm text-white/70">
              <li v-for="feature in premiumFeatures" :key="feature" class="flex items-start gap-2">
                <UIcon name="i-heroicons-check" class="w-4 h-4 mt-0.5 text-gold-300 shrink-0" /> {{ feature }}
              </li>
            </ul>
            <UButton
              v-if="isOwnWedding"
              block
              color="primary"
              class="mt-5 font-semibold"
              :disabled="wedding.plan === 'premium'"
              icon="i-heroicons-credit-card"
              @click="openPayModal"
            >
              {{ wedding.plan === 'premium' ? 'Current plan' : 'Pay with ToyyibPay' }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Premium theme gallery -->
      <div>
        <h2 class="font-display text-lg mb-3">Theme pricing</h2>
        <div class="grid sm:grid-cols-2 gap-3">
          <div v-for="theme in allThemes" :key="theme.id" class="theme-row">
            <div class="flex items-center gap-3 min-w-0">
              <span class="swatch" :style="{ background: `linear-gradient(135deg, ${theme.palette.bgFrom}, ${theme.palette.accent})` }" />
              <div class="min-w-0">
                <p class="truncate">{{ theme.name }}</p>
                <p class="text-xs text-white/40 truncate">{{ theme.tagline }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <UIcon v-if="theme.price > 0 && wedding.plan !== 'premium'" name="i-heroicons-lock-closed" class="w-3.5 h-3.5 text-white/30" />
              <span :class="theme.price === 0 ? 'text-emerald-300' : 'text-gold-300'">{{ theme.price === 0 ? 'Free' : `RM ${theme.price}` }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment history (ToyyibPay) -->
      <div>
        <h2 class="font-display text-lg mb-3">Payment history</h2>
        <div v-if="payments.length === 0" class="text-sm text-white/40 py-6 text-center border border-dashed border-white/10 rounded-xl">
          No payments yet.
        </div>
        <div v-else class="space-y-2">
          <div v-for="payment in payments" :key="payment.id" class="history-row">
            <div class="min-w-0">
              <p class="text-sm font-medium text-white flex items-center gap-2 flex-wrap">
                Premium upgrade
                <UBadge :color="paymentStatusColor(payment.status)" variant="subtle" size="sm">{{ paymentStatusLabelFor(payment.status) }}</UBadge>
              </p>
              <p class="text-xs text-white/40 mt-0.5">
                {{ formatDate(payment.createdAt) }}<span v-if="payment.themeName"> · {{ payment.themeName }}</span>
              </p>
            </div>
            <span class="text-sm text-gold-300 shrink-0">RM {{ (payment.amountCents / 100).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Manual request history -->
      <div>
        <h2 class="font-display text-lg mb-3">Manual request history</h2>
        <div v-if="requests.length === 0" class="text-sm text-white/40 py-6 text-center border border-dashed border-white/10 rounded-xl">
          No manual upgrade requests yet.
        </div>
        <div v-else class="space-y-2">
          <div v-for="req in requests" :key="req.id" class="history-row">
            <div class="min-w-0">
              <p class="text-sm font-medium text-white flex items-center gap-2 flex-wrap">
                Premium upgrade
                <UBadge :color="statusColor(req.status)" variant="subtle" size="sm">{{ statusLabel(req.status) }}</UBadge>
              </p>
              <p class="text-xs text-white/40 mt-0.5">
                {{ formatDate(req.createdAt) }}<span v-if="req.themeName"> · {{ req.themeName }}</span>
              </p>
              <p v-if="req.note" class="text-xs text-white/40 mt-1 italic truncate">"{{ req.note }}"</p>
            </div>
            <span class="text-sm text-gold-300 shrink-0">RM {{ req.estimatedAmount }}</span>
          </div>
        </div>

        <!-- Manual fallback - keeps the old "we'll arrange payment with you"
             path available for couples who can't or don't want to pay by FPX. -->
        <div v-if="wedding.plan !== 'premium' && isOwnWedding" class="mt-4 text-center">
          <button class="text-xs text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors" @click="openManualModal">
            Prefer to arrange payment manually? Send us a request instead
          </button>
        </div>
      </div>
    </div>

    <!-- ToyyibPay payment modal -->
    <UModal v-model:open="payModalOpen" title="Upgrade to Premium">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-white/60">
            Pay by FPX online banking via ToyyibPay. Premium unlocks automatically the moment payment is confirmed.
          </p>

          <UFormField label="Choose the premium theme you love" required>
            <USelect v-model="payForm.themeId" :items="premiumThemeOptions" class="w-full" />
          </UFormField>

          <div class="price-line">
            <span class="text-sm text-white/60">Total to pay</span>
            <span class="text-xl font-bold text-gold-200">RM {{ selectedPremiumPrice.toFixed(2) }}</span>
          </div>

          <div class="border-t border-white/10 pt-4 space-y-3">
            <p class="text-xs uppercase tracking-wider text-white/40">Payer details (for the receipt)</p>
            <UFormField label="Full name" required>
              <UInput v-model="payForm.payerName" placeholder="e.g. Nur Aisyah binti Ahmad" class="w-full" />
            </UFormField>
            <UFormField label="Email" required>
              <UInput v-model="payForm.payerEmail" type="email" placeholder="you@email.com" class="w-full" />
            </UFormField>
            <UFormField label="Phone number" required>
              <UInput v-model="payForm.payerPhone" type="tel" placeholder="e.g. 0123456789" class="w-full" />
            </UFormField>
          </div>

          <p v-if="payError" class="text-sm text-rose-300">{{ payError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton variant="ghost" color="neutral" @click="payModalOpen = false">Cancel</UButton>
          <UButton color="primary" :loading="paySubmitting" :disabled="!payFormValid" @click="startPayment">
            Pay RM {{ selectedPremiumPrice.toFixed(2) }} with ToyyibPay
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Manual upgrade request modal (fallback) -->
    <UModal v-model:open="manualModalOpen" title="Request Premium upgrade manually">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-white/60">
            This sends us your request - we'll follow up to arrange payment (estimated from RM {{ cheapestPremiumPrice }}), then activate Premium on your card ourselves.
          </p>
          <UFormField label="Which premium theme are you most excited about? (optional)">
            <USelect
              v-model="manualForm.themeId"
              :items="premiumThemeOptions"
              placeholder="Any premium theme"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Anything you'd like us to know? (optional)">
            <UTextarea v-model="manualForm.note" :rows="3" placeholder="e.g. preferred payment method, timeline..." class="w-full" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton variant="ghost" color="neutral" @click="manualModalOpen = false">Cancel</UButton>
          <UButton color="primary" :loading="manualSubmitting" @click="submitManualRequest">Send request</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import confetti from 'canvas-confetti'

// This is the real Billing panel, shared by /dashboard/billing and the
// /admin/wedding/[id]/billing admin page. overrideWeddingId is only ever
// set by the admin page; couples hitting their own dashboard never pass
// it, so useMyWedding() falls back to its normal own-wedding lookup.
const props = defineProps<{ overrideWeddingId?: string | null }>()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const { wedding, loading } = useMyWedding(toRef(props, 'overrideWeddingId'))
const { allThemes } = useThemes()
const { requests, pendingRequest, submitUpgradeRequest } = useBillingRequests(computed(() => wedding.value?.id))
const { payments } = usePayments(computed(() => wedding.value?.id))
const { serverFetch } = useServerFetch()
const { currentUser, profile } = useAuthState()

// Only the couple themselves pays - admins viewing someone else's billing
// page see history but never the pay button.
const isOwnWedding = computed(() => !props.overrideWeddingId)

const freeFeatures = [
  '2 free themes',
  'Unlimited RSVPs',
  'Guest list (VIP + general)',
  'Printable card',
  'Full multi-language RSVP flow'
]
const premiumFeatures = [
  'All premium themes unlocked',
  'Everything in Free',
  'Priority support'
]

const premiumThemes = computed(() => allThemes.value.filter((t) => t.price > 0))
const cheapestPremiumPrice = computed(() => premiumThemes.value.reduce((min, t) => Math.min(min, t.price), premiumThemes.value[0]?.price ?? 29))
const premiumThemeOptions = computed(() => premiumThemes.value.map((t) => ({ label: `${t.name} (RM ${t.price})`, value: t.id })))

const paymentStatusLabel = computed(() => {
  if (!wedding.value) return ''
  return wedding.value.paymentStatus === 'paid' ? 'Paid' : wedding.value.paymentStatus === 'pending' ? 'Payment pending' : 'Unpaid'
})

// ---- ToyyibPay payment modal ----
const payModalOpen = ref(false)
const paySubmitting = ref(false)
const payError = ref('')
const payForm = reactive({
  themeId: '',
  payerName: '',
  payerEmail: '',
  payerPhone: ''
})

const selectedPremiumPrice = computed(() => premiumThemes.value.find((t) => t.id === payForm.themeId)?.price ?? 0)
const payFormValid = computed(
  () =>
    !!payForm.themeId &&
    payForm.payerName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payForm.payerEmail.trim()) &&
    payForm.payerPhone.replace(/[^\d]/g, '').length >= 8
)

function openPayModal() {
  payForm.themeId = premiumThemes.value[0]?.id ?? ''
  payForm.payerName = profile.value?.displayName || ''
  payForm.payerEmail = currentUser.value?.email || ''
  payForm.payerPhone = ''
  payError.value = ''
  payModalOpen.value = true
}

async function startPayment() {
  if (!wedding.value || !payFormValid.value) return
  paySubmitting.value = true
  payError.value = ''
  try {
    const result = await serverFetch<{ payUrl: string }>('/api/payments/create-bill', {
      method: 'POST',
      body: {
        weddingId: wedding.value.id,
        themeId: payForm.themeId,
        payerName: payForm.payerName.trim(),
        payerEmail: payForm.payerEmail.trim(),
        payerPhone: payForm.payerPhone.trim()
      }
    })
    payModalOpen.value = false
    // Full navigation (not router.push) - ToyyibPay's hosted bill page is
    // a different site, and they'll send the payer back to our return URL.
    window.location.href = result.payUrl
  } catch (error) {
    payError.value = error instanceof Error && error.message && !error.message.includes('fetch')
      ? error.message
      : 'Could not start the payment. Please try again in a moment.'
    const statusMessage = (error as { statusMessage?: string } | null)?.statusMessage
    if (statusMessage) payError.value = statusMessage
  } finally {
    paySubmitting.value = false
  }
}

// ---- Return from ToyyibPay: verify the payment ----
type PaymentReturnState = 'idle' | 'verifying' | 'paid' | 'failed' | 'timeout'
const paymentReturn = ref<PaymentReturnState>('idle')
const rechecking = ref(false)
let pollTimer: ReturnType<typeof setTimeout> | null = null

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
}

async function checkPaymentStatus(attempt: number) {
  const billCode = String(route.query.billcode || '')
  const orderId = String(route.query.order_id || '')
  if (!billCode && !orderId) return

  try {
    const result = await serverFetch<{ status: string }>('/api/payments/status', {
      query: { billCode, orderId }
    })
    if (result.status === 'paid') {
      paymentReturn.value = 'paid'
      fireConfetti()
      toast.add({ title: 'Premium unlocked!', description: 'Your payment was confirmed.', color: 'success' })
      cleanReturnParams()
      return
    }
    if (result.status === 'failed') {
      paymentReturn.value = 'failed'
      cleanReturnParams()
      return
    }
  } catch {
    // Token/network hiccup - keep trying until attempts run out.
  }

  if (attempt >= 10) {
    paymentReturn.value = 'timeout'
    return
  }
  pollTimer = setTimeout(() => checkPaymentStatus(attempt + 1), 3000)
}

async function checkPaymentOnce() {
  rechecking.value = true
  paymentReturn.value = 'verifying'
  try {
    await checkPaymentStatus(1)
  } finally {
    rechecking.value = false
  }
}

function cleanReturnParams() {
  // Drop ToyyibPay's query params so refreshing doesn't re-run verification.
  router.replace({ query: {} })
}

function fireConfetti() {
  confetti({ particleCount: 120, spread: 75, origin: { y: 0.35 }, colors: ['#d4a017', '#f5e6c8', '#ffffff', '#e8b4bc'] })
}

onMounted(() => {
  if (route.query.payment === 'return') {
    paymentReturn.value = 'verifying'
    checkPaymentStatus(1)
  }
})

onBeforeUnmount(stopPolling)

// ---- Manual upgrade request (fallback) ----
const manualModalOpen = ref(false)
const manualSubmitting = ref(false)
const manualForm = reactive({ themeId: '', note: '' })

function openManualModal() {
  manualForm.themeId = ''
  manualForm.note = ''
  manualModalOpen.value = true
}

async function submitManualRequest() {
  manualSubmitting.value = true
  try {
    const theme = premiumThemes.value.find((t) => t.id === manualForm.themeId)
    await submitUpgradeRequest({
      themeId: theme?.id,
      themeName: theme?.name,
      estimatedAmount: theme?.price ?? cheapestPremiumPrice.value,
      note: manualForm.note
    })
    manualModalOpen.value = false
  } finally {
    manualSubmitting.value = false
  }
}

function statusLabel(status: string) {
  return status === 'approved' ? 'Approved' : status === 'declined' ? 'Declined' : 'Pending review'
}
function statusColor(status: string) {
  return status === 'approved' ? 'success' : status === 'declined' ? 'error' : 'warning'
}
function paymentStatusLabelFor(status: string) {
  return status === 'paid' ? 'Paid' : status === 'failed' ? 'Failed' : 'Awaiting payment'
}
function paymentStatusColor(status: string) {
  return status === 'paid' ? 'success' : status === 'failed' ? 'error' : 'warning'
}
function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

useSeoMeta({ title: 'Billing — WeddingCard' })
</script>

<style scoped>
.plan-card {
  border-radius: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.plan-card-highlight {
  border-color: rgba(212, 160, 23, 0.5);
  background: rgba(212, 160, 23, 0.08);
}

.theme-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.9rem;
}

.swatch {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  shrink: 0;
  flex-shrink: 0;
}

.pending-card {
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.history-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.payment-banner {
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid;
}

.payment-banner-verifying,
.payment-banner-timeout {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.25);
}

.payment-banner-paid {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.3);
}

.payment-banner-failed {
  background: rgba(244, 63, 94, 0.08);
  border-color: rgba(244, 63, 94, 0.3);
}

.price-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem;
  border-radius: 0.75rem;
  background: rgba(212, 160, 23, 0.08);
  border: 1px solid rgba(212, 160, 23, 0.3);
}
</style>
