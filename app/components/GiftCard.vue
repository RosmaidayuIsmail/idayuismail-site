<template>
  <!-- Rendered inside the Details page's card (classic-inner-card/
       classic-inner-card-theme), so text follows --card-text (like every
       other slide in that card) rather than a fixed white - previously
       hardcoded white/gold regardless of card style, so it went muddy on a
       light theme-tinted card. The account-number pill stays theme-accent
       (it's a button, matches every other accent-colored control on these
       pages) rather than --card-text. -->
  <div class="gift-card">
    <UIcon name="i-heroicons-gift" class="w-8 h-8 mx-auto" :style="{ color: 'var(--theme-accent)' }" />
    <p class="mt-2 text-sm text-[color-mix(in_srgb,var(--card-text)_80%,transparent)]">
      Your presence is the greatest gift. For those who’d still like to send a token of love:
    </p>

    <div v-for="(account, index) in banks" :key="index" :class="index > 0 ? 'mt-6 pt-6 border-t border-[color-mix(in_srgb,var(--card-text)_10%,transparent)]' : ''">
      <!-- QR Code Display -->
      <div v-if="account.qrCodeUrl" class="mt-6 mb-4 flex justify-center">
        <div class="p-2 bg-white rounded-xl shadow-lg border border-white/20">
          <img :src="account.qrCodeUrl" alt="Bank Transfer QR Code" class="w-32 h-32 rounded-lg" />
        </div>
      </div>

      <!-- Bank Details -->
      <div class="mt-4 space-y-1 text-sm">
        <p v-if="account.name" class="font-semibold" :style="{ color: 'var(--theme-accent)' }">{{ account.name }}</p>
        <p v-if="account.accountName" class="text-[color-mix(in_srgb,var(--card-text)_90%,transparent)]">{{ account.accountName }}</p>
        <button
          v-if="account.accountNumber"
          type="button"
          class="account-number mt-2"
          @click="copyAccount(account.accountNumber)"
        >
          {{ account.accountNumber }}
          <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <p v-if="copied" class="mt-3 text-xs font-medium text-emerald-400">Account number copied ✨</p>
  </div>
</template>

<script setup lang="ts">
interface BankAccount { name: string; accountName: string; accountNumber: string; qrCodeUrl?: string }

// Accepts either the legacy single `bank` prop (kept for any call site that
// hasn't moved to the array form) or a `banks` array so a card can show a
// second gift account (e.g. the groom's family's own account) alongside the
// first, with one shared intro sentence instead of repeating it.
const props = defineProps<{ bank?: BankAccount; banks?: BankAccount[] }>()
const toast = useToast()
const copied = ref(false)

const banks = computed(() => {
  const list = props.banks && props.banks.length ? props.banks : props.bank ? [props.bank] : []
  return list.filter((b) => b?.accountNumber || b?.qrCodeUrl)
})

async function copyAccount(accountNumber: string) {
  if (!accountNumber) return
  try {
    await navigator.clipboard.writeText(accountNumber.replace(/\s+/g, ''))
    copied.value = true
    toast.add({ title: 'Copied', description: 'Account number copied to clipboard.', color: 'success' })
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    toast.add({ title: 'Could not copy', color: 'error' })
  }
}
</script>

<style scoped>
.gift-card {
  border-radius: 1.25rem;
  padding: 1.75rem 1.5rem;
  text-align: center;
  background: color-mix(in srgb, var(--card-text, #fff) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--theme-accent, #d4a017) 30%, transparent);
  backdrop-filter: blur(8px);
}

.account-number {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--theme-accent, #d4a017) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--theme-accent, #d4a017) 40%, transparent);
  color: var(--theme-accent, #d4a017);
  cursor: pointer;
  transition: all 0.2s ease;
}

.account-number:hover {
  background: color-mix(in srgb, var(--theme-accent, #d4a017) 25%, transparent);
  transform: translateY(-1px);
}
</style>