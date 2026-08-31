export interface CountdownValue {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
}

function computeCountdown(targetTime: number): CountdownValue {
  const diff = targetTime - Date.now()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  }

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    isPast: false
  }
}

/**
 * Reactive countdown to a target date. The first value is computed synchronously
 * (so SSR output already shows the right numbers) and then ticks every second
 * once mounted on the client.
 */
export function useCountdown(target: string | Date) {
  const targetTime = new Date(target).getTime()
  const timeLeft = ref<CountdownValue>(computeCountdown(targetTime))
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    timeLeft.value = computeCountdown(targetTime)
    timer = setInterval(() => {
      timeLeft.value = computeCountdown(targetTime)
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  return { timeLeft }
}
