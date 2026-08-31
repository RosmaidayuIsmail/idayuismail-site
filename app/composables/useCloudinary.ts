/**
 * Rewrites a Cloudinary delivery URL to request an auto-format
 * (WebP/AVIF where supported), auto-quality, width-capped version instead
 * of the raw original upload. A photo straight off a phone camera can be
 * 5-10MB - guests on mobile data were downloading that in full for every
 * cover/background photo, which is why those images appeared slowly and
 * looked "broken" for a moment before popping in.
 *
 * Safe no-op for non-Cloudinary URLs (external links, empty strings, etc.)
 * so it can be applied everywhere a stored image URL is rendered.
 */
export function optimizedImageUrl(url: string | undefined | null, width = 1600): string {
  if (!url) return ''
  const marker = '/upload/'
  const markerIndex = url.indexOf(marker)
  if (!url.includes('res.cloudinary.com') || markerIndex === -1) return url
  // Already has transformation params applied (e.g. re-processed elsewhere) - don't double up.
  if (/\/upload\/[^/]*\bf_auto\b/.test(url)) return url
  const insertAt = markerIndex + marker.length
  return `${url.slice(0, insertAt)}f_auto,q_auto,w_${width},c_limit/${url.slice(insertAt)}`
}

/**
 * Client-side image upload via Cloudinary's unsigned upload API.
 * No secret key involved - an "unsigned upload preset" (configured in the
 * Cloudinary dashboard) is specifically designed to be safe to call directly
 * from the browser.
 */
export function useCloudinary() {
  const config = useRuntimeConfig().public

  const isConfigured = Boolean(config.cloudinaryCloudName && config.cloudinaryUploadPreset)

  async function uploadToCloudinary(file: Blob, resourceType: 'image' | 'video', folder?: string, filename = 'upload.png'): Promise<string> {
    if (!isConfigured) {
      throw new Error(
        'Cloudinary is not configured. Add NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.'
      )
    }

    const formData = new FormData()
    formData.append('file', file, file instanceof File ? file.name : filename)
    formData.append('upload_preset', config.cloudinaryUploadPreset)
    if (folder) formData.append('folder', folder)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null)
      throw new Error(errorBody?.error?.message || 'Upload failed. Check your Cloudinary cloud name and upload preset.')
    }

    const data = (await response.json()) as { secure_url: string }
    return data.secure_url
  }

  async function uploadImage(file: Blob, folder?: string, filename = 'upload.png'): Promise<string> {
    return uploadToCloudinary(file, 'image', folder, filename)
  }

  // Cloudinary files audio under its "video" resource type - there's no
  // separate audio endpoint. Used for the Opening Design background music
  // upload.
  async function uploadAudio(file: Blob, folder?: string, filename = 'upload.mp3'): Promise<string> {
    return uploadToCloudinary(file, 'video', folder, filename)
  }

  return { isConfigured, uploadImage, uploadAudio }
}