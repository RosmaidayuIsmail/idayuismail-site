<template>
  <div>
    <div v-if="plans.length === 0" class="rounded-3xl border border-dashed border-ink-900/15 dark:border-white/15 bg-white/60 dark:bg-white/[0.02] p-12 sm:p-16 text-center">
      <UIcon name="i-heroicons-home-modern" class="w-10 h-10 mx-auto text-emerald-500/70 mb-4" />
      <h3 class="font-display text-xl font-bold text-ink-950 dark:text-white mb-2">No plans yet</h3>
      <p class="text-sm text-ink-900/55 dark:text-white/50 max-w-sm mx-auto mb-6">
        Start your first floor plan — draw walls, place doors and windows, furnish the rooms, then see it all in 3D.
      </p>
      <UButton color="primary" size="lg" icon="i-heroicons-plus" class="rounded-full" @click="onNew">
        Start a new plan
      </UButton>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="group rounded-3xl border border-ink-900/10 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden shadow-sm hover-lift cursor-pointer"
        @click="open(plan.id)"
      >
        <div class="aspect-[16/10] w-full bg-ink-950/[0.03] dark:bg-white/[0.04] flex items-center justify-center overflow-hidden">
          <img v-if="plan.thumbnail" :src="plan.thumbnail" :alt="plan.name" class="w-full h-full object-cover" />
          <UIcon v-else name="i-heroicons-square-3-stack-3d" class="w-10 h-10 text-ink-900/20 dark:text-white/20" />
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-3 mb-1">
            <h3 class="font-display font-bold text-lg text-ink-950 dark:text-white truncate">{{ plan.name }}</h3>
            <UDropdownMenu
              :items="menuItems(plan)"
              :ui="{ content: 'min-w-36' }"
              @click.stop
            >
              <UButton
                icon="i-heroicons-ellipsis-vertical"
                variant="ghost"
                color="neutral"
                size="xs"
                @click.stop
              />
            </UDropdownMenu>
          </div>
          <p class="text-xs text-ink-900/45 dark:text-white/40">
            {{ plan.walls.length }} walls · {{ plan.furniture.length }} furniture · edited {{ formatTime(plan.updatedAt) }}
          </p>
        </div>
      </div>

      <button
        type="button"
        class="rounded-3xl border border-dashed border-ink-900/15 dark:border-white/15 min-h-52 flex flex-col items-center justify-center gap-3 text-ink-900/50 dark:text-white/50 transition-colors hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-300"
        @click="onNew"
      >
        <UIcon name="i-heroicons-plus-circle" class="w-8 h-8" />
        <span class="text-sm font-medium">New plan</span>
      </button>
    </div>

    <UModal v-model:open="renameOpen" title="Rename plan" :ui="{ width: 'sm' }">
      <div v-if="renaming" class="p-5 space-y-4">
        <UInput v-model="renaming.name" placeholder="Plan name" size="lg" autofocus @keyup.enter="confirmRename" />
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="soft" @click="renaming = null">Cancel</UButton>
          <UButton color="primary" @click="confirmRename">Save</UButton>
        </div>
      </div>
    </UModal>

    <UModal v-model:open="deleteOpen" title="Delete plan?" :ui="{ width: 'sm' }">
      <div v-if="deleting" class="p-5 space-y-4">
        <p class="text-sm text-ink-900/70 dark:text-white/70">
          "{{ deleting.name }}" will be gone for good. This can't be undone.
        </p>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="soft" @click="deleting = null">Keep it</UButton>
          <UButton color="error" @click="confirmDelete">Delete</UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { plans, createPlan, deletePlan, duplicatePlan, patchPlan } = useStudioPlan()

const renaming = ref<{ id: string; name: string } | null>(null)
const deleting = ref<Plan | null>(null)

const renameOpen = computed({
  get: () => renaming.value !== null,
  set: (v: boolean) => { if (!v) renaming.value = null }
})
const deleteOpen = computed({
  get: () => deleting.value !== null,
  set: (v: boolean) => { if (!v) deleting.value = null }
})

function onNew() {
  const plan = createPlan()
  router.push(`/studio/editor/${plan.id}`)
}

function open(id: string) {
  router.push(`/studio/editor/${id}`)
}

function menuItems(plan: Plan) {
  return [
    { label: 'Open', icon: 'i-heroicons-arrow-up-right', onSelect: () => open(plan.id) },
    { label: 'Rename', icon: 'i-heroicons-pencil', onSelect: () => { renaming.value = { id: plan.id, name: plan.name } } },
    { label: 'Duplicate', icon: 'i-heroicons-square-2-stack', onSelect: () => duplicatePlan(plan.id) },
    { label: 'Delete', icon: 'i-heroicons-trash', color: 'error' as const, onSelect: () => { deleting.value = plan } }
  ]
}

function confirmRename() {
  if (renaming.value && renaming.value.name.trim()) {
    patchPlan(renaming.value.id, { name: renaming.value.name.trim() })
  }
  renaming.value = null
}

function confirmDelete() {
  if (deleting.value) deletePlan(deleting.value.id)
  deleting.value = null
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return new Date(ts).toLocaleDateString()
}
</script>
