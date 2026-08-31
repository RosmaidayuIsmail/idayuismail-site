export interface FurnitureSymbolDef {
  id: string
  label: string
  w: number
  h: number
  svg: (w: number, h: number) => string
}

// Top-view symbols drawn centered on (0,0), stroke/fill inherit currentColor.
const rect = (w: number, h: number, extra = '') =>
  `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="none" stroke="currentColor" stroke-width="0.04" ${extra} />`

export const FURNITURE_SYMBOLS: FurnitureSymbolDef[] = [
  {
    id: 'bed-double',
    label: 'Double bed',
    w: 1.6,
    h: 2.0,
    svg: (w, h) =>
      rect(w, h, 'rx="0.06"') +
      `<line x1="${-w / 2 + 0.1}" y1="${-h / 2 + 0.35}" x2="${w / 2 - 0.1}" y2="${-h / 2 + 0.35}" stroke="currentColor" stroke-width="0.04" />` +
      `<rect x="${-w / 2 + 0.15}" y="${-h / 2 + 0.08}" width="${w / 2 - 0.25}" height="0.2" rx="0.06" fill="none" stroke="currentColor" stroke-width="0.03" />` +
      `<rect x="0.1" y="${-h / 2 + 0.08}" width="${w / 2 - 0.25}" height="0.2" rx="0.06" fill="none" stroke="currentColor" stroke-width="0.03" />`
  },
  {
    id: 'bed-single',
    label: 'Single bed',
    w: 1.0,
    h: 2.0,
    svg: (w, h) =>
      rect(w, h, 'rx="0.06"') +
      `<line x1="${-w / 2 + 0.08}" y1="${-h / 2 + 0.35}" x2="${w / 2 - 0.08}" y2="${-h / 2 + 0.35}" stroke="currentColor" stroke-width="0.04" />` +
      `<rect x="${-w / 2 + 0.15}" y="${-h / 2 + 0.08}" width="${w - 0.3}" height="0.2" rx="0.06" fill="none" stroke="currentColor" stroke-width="0.03" />`
  },
  {
    id: 'sofa',
    label: 'Sofa',
    w: 2.0,
    h: 0.9,
    svg: (w, h) =>
      rect(w, h, 'rx="0.08"') +
      `<line x1="${-w / 2 + 0.15}" y1="${-h / 2 + 0.25}" x2="${w / 2 - 0.15}" y2="${-h / 2 + 0.25}" stroke="currentColor" stroke-width="0.04" />` +
      `<line x1="${-w / 2 + 0.2}" y1="${-h / 2 + 0.25}" x2="${-w / 2 + 0.2}" y2="${h / 2 - 0.1}" stroke="currentColor" stroke-width="0.03" />` +
      `<line x1="${w / 2 - 0.2}" y1="${-h / 2 + 0.25}" x2="${w / 2 - 0.2}" y2="${h / 2 - 0.1}" stroke="currentColor" stroke-width="0.03" />`
  },
  {
    id: 'table',
    label: 'Table',
    w: 1.4,
    h: 0.8,
    svg: (w, h) =>
      rect(w, h, 'rx="0.05"') +
      `<circle cx="0" cy="0" r="${Math.min(w, h) / 6}" fill="none" stroke="currentColor" stroke-width="0.03" />`
  },
  {
    id: 'chair',
    label: 'Chair',
    w: 0.45,
    h: 0.45,
    svg: (w, h) =>
      rect(w, h, 'rx="0.05"') +
      `<line x1="${-w / 2}" y1="${-h / 2 + 0.08}" x2="${w / 2}" y2="${-h / 2 + 0.08}" stroke="currentColor" stroke-width="0.05" />`
  },
  {
    id: 'toilet',
    label: 'Toilet',
    w: 0.4,
    h: 0.65,
    svg: (w, h) =>
      `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="0.18" fill="none" stroke="currentColor" stroke-width="0.04" />` +
      `<ellipse cx="0" cy="${h / 2 - 0.24}" rx="${w / 2 - 0.02}" ry="0.22" fill="none" stroke="currentColor" stroke-width="0.04" />`
  },
  {
    id: 'sink',
    label: 'Sink',
    w: 0.55,
    h: 0.45,
    svg: (w, h) =>
      rect(w, h, 'rx="0.05"') +
      `<circle cx="0" cy="0.02" r="${Math.min(w, h) / 3.2}" fill="none" stroke="currentColor" stroke-width="0.03" />` +
      `<line x1="0" y1="${-h / 2}" x2="0" y2="${-h / 2 + 0.1}" stroke="currentColor" stroke-width="0.04" />`
  },
  {
    id: 'bathtub',
    label: 'Bathtub',
    w: 0.8,
    h: 1.7,
    svg: (w, h) =>
      rect(w, h, 'rx="0.15"') +
      `<rect x="${-w / 2 + 0.1}" y="${-h / 2 + 0.1}" width="${w - 0.2}" height="${h - 0.2}" rx="0.12" fill="none" stroke="currentColor" stroke-width="0.03" />` +
      `<circle cx="0" cy="${h / 2 - 0.3}" r="0.04" fill="currentColor" />`
  },
  {
    id: 'stove',
    label: 'Stove',
    w: 0.6,
    h: 0.6,
    svg: (w, h) =>
      rect(w, h, 'rx="0.04"') +
      `<circle cx="${-w / 4}" cy="${-h / 4}" r="0.08" fill="none" stroke="currentColor" stroke-width="0.03" />` +
      `<circle cx="${w / 4}" cy="${-h / 4}" r="0.08" fill="none" stroke="currentColor" stroke-width="0.03" />` +
      `<circle cx="${-w / 4}" cy="${h / 4}" r="0.08" fill="none" stroke="currentColor" stroke-width="0.03" />` +
      `<circle cx="${w / 4}" cy="${h / 4}" r="0.08" fill="none" stroke="currentColor" stroke-width="0.03" />`
  },
  {
    id: 'fridge',
    label: 'Fridge',
    w: 0.6,
    h: 0.6,
    svg: (w, h) =>
      rect(w, h, 'rx="0.04"') +
      `<line x1="${-w / 2 + 0.08}" y1="${-h / 2 + 0.08}" x2="${w / 2 - 0.08}" y2="${h / 2 - 0.08}" stroke="currentColor" stroke-width="0.03" />`
  },
  {
    id: 'wardrobe',
    label: 'Wardrobe',
    w: 1.2,
    h: 0.6,
    svg: (w, h) =>
      rect(w, h) +
      `<line x1="0" y1="${-h / 2}" x2="0" y2="${h / 2}" stroke="currentColor" stroke-width="0.03" />` +
      `<line x1="${-w / 2}" y1="${h / 2}" x2="0" y2="0" stroke="currentColor" stroke-width="0.02" />` +
      `<line x1="${w / 2}" y1="${h / 2}" x2="0" y2="0" stroke="currentColor" stroke-width="0.02" />`
  },
  {
    id: 'plant',
    label: 'Plant',
    w: 0.4,
    h: 0.4,
    svg: (w) =>
      `<circle cx="0" cy="0" r="${w / 2}" fill="none" stroke="currentColor" stroke-width="0.04" />` +
      `<line x1="0" y1="${-w / 2}" x2="0" y2="${w / 2}" stroke="currentColor" stroke-width="0.02" />` +
      `<line x1="${-w / 2}" y1="0" x2="${w / 2}" y2="0" stroke="currentColor" stroke-width="0.02" />`
  }
]

export function getFurnitureSymbol(id: string): FurnitureSymbolDef {
  return FURNITURE_SYMBOLS.find((s) => s.id === id) ?? FURNITURE_SYMBOLS[0]
}
