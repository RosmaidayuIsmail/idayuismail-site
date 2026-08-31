<template>
  <div>
    <div v-if="loading" class="text-center text-white/60 py-20">Loading...</div>

    <div v-else-if="!wedding" class="text-center text-white/60 py-20">
      <p>You haven't created your wedding card yet.</p>
      <UButton to="/dashboard" class="mt-4">Go create it</UButton>
    </div>

    <div v-else class="space-y-8 max-w-4xl">
      <div>
        <h1 class="text-2xl sm:text-3xl font-display font-bold text-gold-100">Physical Cards</h1>
        <p class="text-sm text-white/60 mt-1">
          A printed card that links straight back to your live invitation — same cover, countdown and RSVP, just something a guest can hold first.
        </p>
      </div>

      <!-- How ordering works right now -->
      <UAlert
        icon="i-heroicons-information-circle"
        color="info"
        variant="soft"
        title="How ordering works right now"
        description="Live checkout isn't connected yet. Placing an order below sends us your details - we'll follow up to confirm the design and arrange payment, then take it to production."
      />

      <!-- Pending order status -->
      <div v-if="pendingOrder" class="pending-card">
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-clock" class="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-white">Your order is being reviewed</p>
            <p class="text-sm text-white/60 mt-1">
              Submitted {{ formatDate(pendingOrder.createdAt) }} · {{ pendingOrder.tierLabel }} · {{ pendingOrder.quantity }} pcs
            </p>
            <p class="text-xs text-white/40 mt-3">We'll reach out to confirm the design and arrange payment - no need to submit again.</p>
          </div>
        </div>
      </div>

      <!-- Tiers -->
      <div>
        <h2 class="font-display text-lg mb-3">Choose a format</h2>
        <div class="grid sm:grid-cols-3 gap-4">
          <div v-for="tier in TIERS" :key="tier.id" class="tier-card" :class="{ 'tier-card-highlight': tier.id === 'lace' }">
            <p class="font-display text-lg" :class="tier.id === 'lace' ? 'text-gold-200' : ''">{{ tier.label }}</p>
            <p class="text-xs text-white/50 mt-1.5 leading-relaxed">{{ tier.tagline }}</p>
            <p class="text-lg font-bold mt-3">From RM {{ tier.prices[10] }}</p>
            <p class="text-xs text-white/40">{{ tier.stock }} · 10 pcs</p>
            <UButton block variant="soft" color="neutral" class="mt-4" :disabled="!!pendingOrder" @click="openOrderModal(tier.id)">
              {{ pendingOrder ? 'Order pending' : 'Order this' }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Order history -->
      <div>
        <h2 class="font-display text-lg mb-3">Order history</h2>
        <div v-if="orders.length === 0" class="text-sm text-white/40 py-6 text-center border border-dashed border-white/10 rounded-xl">
          No physical card orders yet.
        </div>
        <div v-else class="space-y-2">
          <div v-for="order in orders" :key="order.id" class="history-row">
            <div class="min-w-0">
              <p class="text-sm font-medium text-white flex items-center gap-2 flex-wrap">
                {{ order.tierLabel }}
                <UBadge :color="statusColor(order.status)" variant="subtle" size="sm">{{ statusLabel(order.status) }}</UBadge>
              </p>
              <p class="text-xs text-white/40 mt-0.5">{{ formatDate(order.createdAt) }} · {{ order.quantity }} pcs · ships to {{ order.shippingCity || '—' }}</p>
            </div>
            <span class="text-sm text-gold-300 shrink-0">RM {{ order.totalAmount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Order modal -->
    <UModal v-model:open="orderModalOpen" :title="`Order ${selectedTier?.label || 'a card'}`">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-white/60">
            This sends us your order - we'll follow up to confirm the design and arrange payment, then take it to production.
          </p>

          <UFormField label="Quantity">
            <USelect v-model="orderForm.quantity" :items="quantityOptions" class="w-full" />
          </UFormField>

          <UFormField label="Envelope colour">
            <USelect v-model="orderForm.envelopeColor" :items="ENVELOPE_COLORS" class="w-full" />
          </UFormField>

          <div class="grid sm:grid-cols-2 gap-4">
            <UFormField label="Full name">
              <UInput v-model="orderForm.shippingName" placeholder="For the delivery" class="w-full" />
            </UFormField>
            <UFormField label="Phone number">
              <UInput v-model="orderForm.shippingPhone" placeholder="e.g. 012-345 6789" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Delivery address">
            <UTextarea v-model="orderForm.shippingAddress" :rows="2" placeholder="Street address" class="w-full" />
          </UFormField>

          <div class="grid sm:grid-cols-3 gap-4">
            <UFormField label="City">
              <UInput v-model="orderForm.shippingCity" class="w-full" />
            </UFormField>
            <UFormField label="Postcode">
              <UInput v-model="orderForm.shippingPostcode" class="w-full" />
            </UFormField>
            <UFormField label="State">
              <UInput v-model="orderForm.shippingState" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Anything you'd like us to know? (optional)">
            <UTextarea v-model="orderForm.notes" :rows="2" placeholder="e.g. guest name printing on the stub, preferred colours..." class="w-full" />
          </UFormField>

          <p class="text-sm text-white/70 flex items-center justify-between border-t border-white/10 pt-3">
            <span>Estimated total</span>
            <span class="text-gold-300 font-semibold">RM {{ orderTotal }}</span>
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton variant="ghost" color="neutral" @click="orderModalOpen = false">Cancel</UButton>
          <UButton color="primary" :loading="submitting" :disabled="!canSubmit" @click="submitOrderForm">Send order</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
// Shared by /dashboard/physical-cards and the /admin/wedding/[id]/physical-cards
// admin page, same overrideWeddingId pattern as DashboardBillingPanel.vue.
const props = defineProps<{ overrideWeddingId?: string | null }>()
const { wedding, loading } = useMyWedding(toRef(props, 'overrideWeddingId'))
const { orders, pendingOrder, submitOrder } = usePhysicalOrders(computed(() => wedding.value?.id))

// Pricing is intentionally a plain constant here, not read from Firestore -
// there's no live vendor/production line yet (see the physical-cards
// strategy doc), so these are starting figures to validate demand with,
// easy to tweak in one place once real print costs are confirmed.
const TIERS = [
  {
    id: 'flat' as const,
    label: 'Signature Flat Card',
    tagline: 'A single shaped card with a QR link to your live invitation.',
    stock: '320gsm matte, digital print',
    prices: { 10: 400, 25: 500, 50: 700, 100: 1200, 150: 1650 } as Record<number, number>
  },
  {
    id: 'fold' as const,
    label: 'Signature Fold Card',
    tagline: 'A shaped gatefold, closed with a wax seal.',
    stock: '250gsm shimmer + wax seal',
    prices: { 10: 900, 25: 1100, 50: 1400, 100: 2400, 150: 3200 } as Record<number, number>
  },
  {
    id: 'lace' as const,
    label: 'Signature Lace Card',
    tagline: 'A laser-cut floral sleeve over a monogram insert.',
    stock: '250gsm shimmer, laser-cut',
    prices: { 10: 1180, 25: 1480, 50: 1680, 100: 2280, 150: 3080 } as Record<number, number>
  }
]

const ENVELOPE_COLORS = ['Champagne', 'Gold', 'Red', 'Pink']

const orderModalOpen = ref(false)
const submitting = ref(false)
const selectedTierId = ref<(typeof TIERS)[number]['id']>('flat')
const selectedTier = computed(() => TIERS.find((t) => t.id === selectedTierId.value))

const orderForm = reactive({
  quantity: 10,
  envelopeColor: 'Champagne',
  shippingName: '',
  shippingPhone: '',
  shippingAddress: '',
  shippingCity: '',
  shippingPostcode: '',
  shippingState: '',
  notes: ''
})

const quantityOptions = computed(() =>
  Object.keys(selectedTier.value?.prices || {})
    .map(Number)
    .sort((a, b) => a - b)
    .map((qty) => ({ label: `${qty} pcs — RM ${selectedTier.value?.prices[qty]}`, value: qty }))
)

const orderTotal = computed(() => selectedTier.value?.prices[orderForm.quantity] ?? 0)

const canSubmit = computed(() =>
  !!selectedTier.value &&
  orderForm.shippingName.trim().length > 0 &&
  orderForm.shippingPhone.trim().length > 0 &&
  orderForm.shippingAddress.trim().length > 0
)

function openOrderModal(tierId: (typeof TIERS)[number]['id']) {
  selectedTierId.value = tierId
  const tier = TIERS.find((t) => t.id === tierId)
  orderForm.quantity = tier ? Number(Object.keys(tier.prices)[0]) : 10
  orderForm.envelopeColor = 'Champagne'
  orderForm.shippingName = ''
  orderForm.shippingPhone = ''
  orderForm.shippingAddress = ''
  orderForm.shippingCity = ''
  orderForm.shippingPostcode = ''
  orderForm.shippingState = ''
  orderForm.notes = ''
  orderModalOpen.value = true
}

async function submitOrderForm() {
  if (!selectedTier.value || !canSubmit.value) return
  submitting.value = true
  try {
    await submitOrder({
      tier: selectedTier.value.id,
      tierLabel: selectedTier.value.label,
      quantity: orderForm.quantity,
      totalAmount: orderTotal.value,
      envelopeColor: orderForm.envelopeColor,
      shippingName: orderForm.shippingName,
      shippingPhone: orderForm.shippingPhone,
      shippingAddress: orderForm.shippingAddress,
      shippingCity: orderForm.shippingCity,
      shippingPostcode: orderForm.shippingPostcode,
      shippingState: orderForm.shippingState,
      notes: orderForm.notes
    })
    orderModalOpen.value = false
  } finally {
    submitting.value = false
  }
}

function statusLabel(status: string) {
  if (status === 'confirmed') return 'Confirmed'
  if (status === 'in_production') return 'In production'
  if (status === 'shipped') return 'Shipped'
  if (status === 'delivered') return 'Delivered'
  if (status === 'cancelled') return 'Cancelled'
  return 'Pending review'
}
function statusColor(status: string) {
  if (status === 'delivered') return 'success'
  if (status === 'shipped' || status === 'in_production' || status === 'confirmed') return 'primary'
  if (status === 'cancelled') return 'error'
  return 'warning'
}
function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

useSeoMeta({ title: 'Physical Cards — WeddingCard' })
</script>

<style scoped>
.tier-card {
  border-radius: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tier-card-highlight {
  border-color: rgba(212, 160, 23, 0.5);
  background: rgba(212, 160, 23, 0.08);
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
</style>
