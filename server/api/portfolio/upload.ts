// Server-side upload for the portfolio admin (currently: Stories media).
// Reuses the SAME Cloudinary account already configured for the wedding
// side of this app (app/composables/useCloudinary.ts) via its unsigned
// upload preset - no new storage provider or dependency needed. This runs
// server-side (unlike the Nuxt app's client-side upload) because the
// portfolio is a separately-built React SPA with no access to Nuxt's
// runtimeConfig; the admin's browser sends the file here instead, and this
// route forwards it to Cloudinary using the same env vars the Nuxt side
// reads (NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME / _UPLOAD_PRESET) - safe to read
// directly here since they're just an unsigned-preset identifier, not a
// secret, and this endpoint is admin-authed regardless.
export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    setResponseStatus(event, 405)
    return { error: 'Method not allowed' }
  }
  const authErr = portfolioAuthError(event)
  if (authErr) return authErr

  const cloudName = process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  if (!cloudName || !uploadPreset) {
    setResponseStatus(event, 500)
    return { error: 'Cloudinary is not configured on this server.' }
  }

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((p) => p.name === 'file')
  if (!filePart) {
    setResponseStatus(event, 400)
    return { error: 'No file uploaded.' }
  }

  const mediaType = filePart.type?.startsWith('video/') ? 'video' : 'image'
  const uploadForm = new FormData()
  uploadForm.append('file', new Blob([filePart.data], { type: filePart.type }), filePart.filename || 'upload')
  uploadForm.append('upload_preset', uploadPreset)
  uploadForm.append('folder', 'portfolio-stories')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${mediaType}/upload`, {
    method: 'POST',
    body: uploadForm,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null) as { error?: { message?: string } } | null
    setResponseStatus(event, 502)
    return { error: err?.error?.message || 'Upload to Cloudinary failed.' }
  }
  const data = (await res.json()) as { secure_url: string }
  return { url: data.secure_url, type: mediaType }
})
