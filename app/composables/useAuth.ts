import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  reload,
  updateProfile,
  type User
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'

// 'vip' is a wholly separate tier of account from 'couple' - its own
// sign-up (/vip/signup), its own login (/vip/login), its own dashboard
// (/vip/dashboard) and its own admin-approval gate (Platform Admin > VIP
// Approvals). A VIP account never sees the regular couple dashboard or the
// classic/story invitation tools - see middleware/auth.ts and
// middleware/vip.ts for how the two are kept apart.
export type UserRole = 'couple' | 'superadmin' | 'vip'

/**
 * Only meaningful for role 'vip'. 'pending' from the moment they sign up
 * until a superadmin decides; 'approved' unlocks their VIP dashboard;
 * 'rejected' lets them send another request. See firestore.rules - a VIP
 * account can request (write 'pending') but can never write 'approved'
 * for themselves; only a superadmin's write can do that.
 */
export type VipApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  vipApprovalStatus?: VipApprovalStatus
}

// Module-level (shared across every component that calls useAuth)
const currentUser = ref<User | null>(null)
const profile = ref<UserProfile | null>(null)
const authReady = ref(false)
let listenerAttached = false
let readyResolve: (() => void) | null = null

// Guards against a race with the onAuthStateChanged listener below: calling
// createUserWithEmailAndPassword() fires that listener (which calls
// loadProfile()) independently of - and concurrently with - signUp()/
// signUpVip()'s own explicit profile write for the same brand-new user. If
// the listener's loadProfile() runs first, it sees no doc yet and creates
// one defaulted to role:'couple', which can then race with (and for VIP,
// silently undo) signUpVip()'s 'vip' write. While a uid is in here, the
// listener skips loadProfile() and leaves the explicit call in sole charge
// of that user's first profile write.
const pendingManualProfileUid = new Set<string>()
const readyPromise = new Promise<void>((resolve) => {
  readyResolve = resolve
})

// This personal site has exactly one admin. The owner's email self-seeds a
// 'superadmin' profile on first sign-in (see loadProfile) and
// firestore.rules restricts profile creation to this same email, so no one
// else can ever get an account here. Mirrors the rule check exactly.
const SITE_OWNER_EMAIL = 'ismailrosmaidayu@gmail.com'
function isSiteOwnerEmail(email: string | null): boolean {
  return (email ?? '').toLowerCase() === SITE_OWNER_EMAIL
}

async function loadProfile(user: User, db: ReturnType<typeof useFirebase>['db']) {
  if (!db) return

  try {
    const ref = doc(db, 'users', user.uid)
    const snap = await getDoc(ref)

    if (snap.exists()) {
      const data = snap.data() as { role?: UserRole; displayName?: string; vipApprovalStatus?: VipApprovalStatus }
      profile.value = {
        uid: user.uid,
        email: user.email,
        displayName: data.displayName ?? user.displayName,
        role: data.role ?? 'couple',
        vipApprovalStatus: data.vipApprovalStatus
      }
    } else {
      // First sign-in \u2014 create their profile doc. This personal site
      // has exactly one admin: the owner email below self-seeds as
      // 'superadmin'; firestore.rules only ever lets this same email
      // create a profile, so nobody else can get any account at all.
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: isSiteOwnerEmail(user.email) ? 'superadmin' : 'couple'
      }
      await setDoc(ref, {
        email: newProfile.email,
        displayName: newProfile.displayName,
        role: newProfile.role,
        createdAt: serverTimestamp()
      })
      profile.value = newProfile
    }
  } catch (error) {
    // Most commonly: Firestore security rules haven't been deployed yet.
    // We don't want a profile-sync failure to make a successful Auth
    // sign-in/sign-up look like it failed, so this is intentionally
    // swallowed here \u2014 the caller still gets back a valid, signed-in user.
    console.warn(
      '[useAuth] Could not read/create the Firestore user profile. ' +
        'This usually means firestore.rules hasn\u2019t been deployed to your Firebase project yet.',
      error
    )
    profile.value = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: isSiteOwnerEmail(user.email) ? 'superadmin' : 'couple'
    }
  }
}

function attachListener() {
  if (listenerAttached || !import.meta.client) return
  listenerAttached = true

  const { auth, db } = useFirebase()
  if (!auth) {
    authReady.value = true
    readyResolve?.()
    return
  }

  onAuthStateChanged(auth, async (user) => {
    currentUser.value = user
    if (user) {
      // Skip while signUp()/signUpVip() is mid-flight for this exact user -
      // see pendingManualProfileUid above. They already handle their own
      // profile write and will set profile.value themselves.
      if (!pendingManualProfileUid.has(user.uid)) {
        await loadProfile(user, db)
      }
    } else {
      profile.value = null
    }
    if (!authReady.value) {
      authReady.value = true
      readyResolve?.()
    }
  })
}

/** Resolves once Firebase has reported the initial auth state (used by route middleware). */
export function waitForAuthReady() {
  attachListener()
  return readyPromise
}

/**
 * Lightweight accessor for just the current user/profile - safe to call from
 * route middleware, which runs outside a component's setup() context and so
 * can't use anything that relies on Vue's inject() (like useToast(), which
 * the full useAuth() below pulls in).
 */
export function useAuthState() {
  attachListener()
  return { currentUser, profile, authReady }
}

export function useAuth() {
  attachListener()
  const { auth, db, isConfigured } = useFirebase()
  const toast = useToast()

  async function signUp(email: string, password: string, displayName: string) {
    if (!auth) throw new Error('Firebase is not configured')
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    pendingManualProfileUid.add(credential.user.uid)
    try {
      if (displayName) await updateProfile(credential.user, { displayName })
      await loadProfile(credential.user, db)
      await sendVerificationEmail(credential.user)
      currentUser.value = credential.user
      return credential.user
    } finally {
      pendingManualProfileUid.delete(credential.user.uid)
    }
  }

  // Separate sign-up path for the VIP tier (see /vip/signup) - writes the
  // Firestore profile directly with role 'vip' and vipApprovalStatus
  // 'pending', instead of going through loadProfile()'s normal "first
  // sign-in" branch, which always defaults a brand-new profile to 'couple'.
  async function signUpVip(email: string, password: string, displayName: string) {
    if (!auth) throw new Error('Firebase is not configured')
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    pendingManualProfileUid.add(credential.user.uid)
    try {
      if (displayName) await updateProfile(credential.user, { displayName })

      const newProfile: UserProfile = {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName,
        role: 'vip',
        vipApprovalStatus: 'pending'
      }
      if (db) {
        // Unlike loadProfile()'s swallow-and-continue, this write must not
        // fail silently: if it did, the caller would still navigate to the
        // "request received" screen with nothing actually saved for admin
        // to see and approve. Let the error propagate to the sign-up form.
        await setDoc(doc(db, 'users', credential.user.uid), {
          email: newProfile.email,
          displayName: newProfile.displayName,
          role: newProfile.role,
          vipApprovalStatus: newProfile.vipApprovalStatus,
          createdAt: serverTimestamp()
        })
      }
      profile.value = newProfile
      currentUser.value = credential.user
      return credential.user
    } finally {
      pendingManualProfileUid.delete(credential.user.uid)
    }
  }

  async function signIn(email: string, password: string) {
    if (!auth) throw new Error('Firebase is not configured')
    const credential = await signInWithEmailAndPassword(auth, email, password)
    await reload(credential.user)
    await loadProfile(credential.user, db)
    currentUser.value = credential.user
    return credential.user
  }

  async function signInWithGoogle() {
    if (!auth) throw new Error('Firebase is not configured')
    const credential = await signInWithPopup(auth, new GoogleAuthProvider())
    await reload(credential.user)
    await loadProfile(credential.user, db)
    currentUser.value = credential.user
    return credential.user
  }

  // Lets a VIP account (re-)request approval - e.g. after a 'rejected'
  // decision. Firestore rules let a signed-in user write their own
  // vipApprovalStatus to anything EXCEPT 'approved' - only a superadmin's
  // write can grant that, so this can never self-approve.
  async function requestVipStatus() {
    if (!db || !currentUser.value) return
    await updateDoc(doc(db, 'users', currentUser.value.uid), { vipApprovalStatus: 'pending' })
    if (profile.value) profile.value = { ...profile.value, vipApprovalStatus: 'pending' }
  }

  async function sendVerificationEmail(user = currentUser.value) {
    if (!auth || !user) throw new Error('No signed-in user')
    const siteUrl = useRuntimeConfig().public.siteUrl || window.location.origin
    await sendEmailVerification(user, { url: `${siteUrl.replace(/\/$/, '')}/verify-email` })
  }

  async function refreshEmailVerification() {
    if (!currentUser.value) return false
    await reload(currentUser.value)
    currentUser.value = auth?.currentUser || currentUser.value
    return currentUser.value.emailVerified
  }

  async function logOut() {
    if (!auth) return
    await signOut(auth)
    currentUser.value = null
    profile.value = null
    toast.add({ title: 'Signed out', color: 'neutral' })
  }

  return {
    currentUser,
    profile,
    authReady,
    isConfigured,
    signUp,
    signUpVip,
    signIn,
    signInWithGoogle,
    requestVipStatus,
    sendVerificationEmail,
    refreshEmailVerification,
    logOut
  }
}
