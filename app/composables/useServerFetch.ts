/**
 * Thin wrapper around $fetch that attaches the signed-in user's Firebase ID
 * token, for calling our own authenticated /api routes (server routes verify
 * it with firebase-admin). Payment secrets never touch the client - only the
 * resulting redirect URL does.
 */
export function useServerFetch() {
  const { currentUser } = useAuthState()

  async function authHeaders(): Promise<Record<string, string>> {
    const user = currentUser.value
    if (!user) throw new Error('You need to be signed in to do that.')
    const token = await user.getIdToken()
    return { Authorization: `Bearer ${token}` }
  }

  async function serverFetch<T>(url: string, options: Record<string, unknown> = {}): Promise<T> {
    const headers = {
      ...((options.headers as Record<string, string>) || {}),
      ...(await authHeaders())
    }
    return $fetch<T>(url, { ...options, headers })
  }

  return { serverFetch }
}
