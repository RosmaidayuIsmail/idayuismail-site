export function useStudioExport() {
  function serialize(svg: SVGSVGElement, width: number, height: number): string {
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('width', String(width))
    clone.setAttribute('height', String(height))
    return new XMLSerializer().serializeToString(clone)
  }

  function rasterize(svg: SVGSVGElement, width: number, height: number, pixelScale: number): Promise<string> {
    const data = serialize(svg, width, height)
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data)
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(width * pixelScale)
        canvas.height = Math.round(height * pixelScale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('no canvas context'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => reject(new Error('svg raster failed'))
      img.src = url
    })
  }

  async function exportPng(svg: SVGSVGElement, name: string) {
    const rect = svg.getBoundingClientRect()
    const dataUrl = await rasterize(svg, rect.width, rect.height, 2)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${name.replace(/[^\w\d-]+/g, '-').toLowerCase() || 'floor-plan'}.png`
    a.click()
  }

  async function makeThumbnail(svg: SVGSVGElement): Promise<string> {
    const rect = svg.getBoundingClientRect()
    const width = 480
    const height = Math.max(1, Math.round((rect.height / rect.width) * width))
    const dataUrl = await rasterize(svg, width, height, 1)
    return dataUrl
  }

  return { exportPng, makeThumbnail }
}
