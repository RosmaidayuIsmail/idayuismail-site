// --- Minimal, dependency-free .xlsx (OOXML) writer -------------------------
// Hand-rolled instead of using a library (exceljs, xlsx/SheetJS, etc.) after
// a production crash traced to exceljs's deep dependency tree (archiver/
// unzipper/jszip) not surviving Nitro's Vercel serverless bundle - the exact
// same class of failure this codebase already hit once with firebase-admin/
// auth's jwks-rsa+jose chain (see server/utils/firebase-admin.ts). This file
// has ZERO npm dependencies - only Node's built-in Buffer - so there is
// nothing left for a bundler to mis-trace.
//
// Supports just enough OOXML to render buildGuestXLSX() in guest-export.ts:
// one sheet, inline (not shared) strings, per-cell font/fill/alignment/
// border styling, merged cells, column widths, row heights, a frozen pane,
// and an autofilter range.
//
// The ZIP container uses the STORE method (no compression) - larger files
// than a compressed .xlsx, but it means the only moving part is a few
// buffer-offset calculations, not a compression codec. Guest lists are small
// (a spreadsheet, not a video), so the size difference is irrelevant.

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ---- ZIP container ----

function crc32(buf: Buffer): number {
  let crc = ~0
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]!
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return ~crc >>> 0
}

interface ZipEntry { name: string; data: Buffer }

function buildZip(entries: ZipEntry[]): Buffer {
  const localParts: Buffer[] = []
  const centralParts: Buffer[] = []
  let offset = 0

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8')
    const crc = crc32(entry.data)

    const localHeader = Buffer.alloc(30)
    localHeader.writeUInt32LE(0x04034b50, 0) // local file header signature
    localHeader.writeUInt16LE(20, 4) // version needed to extract
    localHeader.writeUInt16LE(0, 6) // general purpose flag
    localHeader.writeUInt16LE(0, 8) // compression method: 0 = store
    localHeader.writeUInt16LE(0, 10) // mod time
    localHeader.writeUInt16LE(0, 12) // mod date
    localHeader.writeUInt32LE(crc, 14)
    localHeader.writeUInt32LE(entry.data.length, 18) // compressed size
    localHeader.writeUInt32LE(entry.data.length, 22) // uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26)
    localHeader.writeUInt16LE(0, 28) // extra field length
    localParts.push(localHeader, nameBuf, entry.data)

    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(0x02014b50, 0) // central directory signature
    centralHeader.writeUInt16LE(20, 4) // version made by
    centralHeader.writeUInt16LE(20, 6) // version needed
    centralHeader.writeUInt16LE(0, 8)
    centralHeader.writeUInt16LE(0, 10)
    centralHeader.writeUInt16LE(0, 12)
    centralHeader.writeUInt16LE(0, 14)
    centralHeader.writeUInt32LE(crc, 16)
    centralHeader.writeUInt32LE(entry.data.length, 20)
    centralHeader.writeUInt32LE(entry.data.length, 24)
    centralHeader.writeUInt16LE(nameBuf.length, 28)
    centralHeader.writeUInt16LE(0, 30) // extra length
    centralHeader.writeUInt16LE(0, 32) // comment length
    centralHeader.writeUInt16LE(0, 34) // disk number start
    centralHeader.writeUInt16LE(0, 36) // internal attrs
    centralHeader.writeUInt32LE(0, 38) // external attrs
    centralHeader.writeUInt32LE(offset, 42) // local header offset
    centralParts.push(centralHeader, nameBuf)

    offset += localHeader.length + nameBuf.length + entry.data.length
  }

  const centralDirectory = Buffer.concat(centralParts)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0) // end of central directory signature
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(entries.length, 8)
  eocd.writeUInt16LE(entries.length, 10)
  eocd.writeUInt32LE(centralDirectory.length, 12)
  eocd.writeUInt32LE(offset, 16)
  eocd.writeUInt16LE(0, 20)

  return Buffer.concat([...localParts, centralDirectory, eocd])
}

// ---- Style registry (fonts / fills / borders / cellXfs, deduped) ----

interface FontSpec { size: number; bold?: boolean; italic?: boolean; color: string }
interface FillSpec { color: string }
interface BorderSpec { bottomColor: string }
interface XfSpec { fontId: number; fillId: number; borderId: number; align?: 'left' | 'center'; valign?: 'center' }

class StyleRegistry {
  private fonts: FontSpec[] = [{ size: 11, color: 'FF000000' }]
  private fills: FillSpec[] = []
  private borders: BorderSpec[] = []
  private xfs: XfSpec[] = [{ fontId: 0, fillId: 0, borderId: 0 }]
  private fontCache = new Map<string, number>()
  private fillCache = new Map<string, number>()
  private borderCache = new Map<string, number>()
  private xfCache = new Map<string, number>()

  private dedupe<T>(list: T[], cache: Map<string, number>, spec: T, baseIndex: number): number {
    const key = JSON.stringify(spec)
    const existing = cache.get(key)
    if (existing !== undefined) return existing
    const id = list.length + baseIndex
    list.push(spec)
    cache.set(key, id)
    return id
  }

  register(opts: {
    size?: number
    bold?: boolean
    italic?: boolean
    color?: string
    fill?: string
    align?: 'left' | 'center'
    valign?: 'center'
    borderBottomColor?: string
  }): number {
    const fontId = this.dedupe(this.fonts, this.fontCache, { size: opts.size || 11, bold: opts.bold, italic: opts.italic, color: opts.color || 'FF000000' }, 0)
    const fillId = opts.fill ? this.dedupe(this.fills, this.fillCache, { color: opts.fill }, 2) : 0
    const borderId = opts.borderBottomColor ? this.dedupe(this.borders, this.borderCache, { bottomColor: opts.borderBottomColor }, 1) : 0
    return this.dedupe(this.xfs, this.xfCache, { fontId, fillId, borderId, align: opts.align, valign: opts.valign }, 0)
  }

  toXml(): string {
    const fontsXml = this.fonts
      .map((f) => `<font><sz val="${f.size}"/>${f.bold ? '<b/>' : ''}${f.italic ? '<i/>' : ''}<color rgb="${f.color}"/><name val="Calibri"/></font>`)
      .join('')

    const fillsXml =
      '<fill><patternFill patternType="none"/></fill>' +
      '<fill><patternFill patternType="gray125"/></fill>' +
      this.fills.map((fl) => `<fill><patternFill patternType="solid"><fgColor rgb="${fl.color}"/><bgColor indexed="64"/></patternFill></fill>`).join('')

    const bordersXml =
      '<border><left/><right/><top/><bottom/><diagonal/></border>' +
      this.borders.map((b) => `<border><left/><right/><top/><bottom style="thin"><color rgb="${b.bottomColor}"/></bottom><diagonal/></border>`).join('')

    const xfsXml = this.xfs
      .map((xf) => {
        const alignAttrs: string[] = []
        if (xf.align) alignAttrs.push(`horizontal="${xf.align}"`)
        if (xf.valign) alignAttrs.push(`vertical="${xf.valign}"`)
        const alignEl = alignAttrs.length ? `<alignment ${alignAttrs.join(' ')}/>` : ''
        return `<xf numFmtId="0" fontId="${xf.fontId}" fillId="${xf.fillId}" borderId="${xf.borderId}" xfId="0" applyFont="1" applyFill="1" applyBorder="1"${alignEl ? ' applyAlignment="1"' : ''}>${alignEl}</xf>`
      })
      .join('')

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="${this.fonts.length}">${fontsXml}</fonts>
<fills count="${this.fills.length + 2}">${fillsXml}</fills>
<borders count="${this.borders.length + 1}">${bordersXml}</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="${this.xfs.length}">${xfsXml}</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`
  }
}

// ---- Public sheet-building API ----

export interface XlsxCellStyle {
  size?: number
  bold?: boolean
  italic?: boolean
  color?: string // 'FFRRGGBB' or 'RRGGBB'
  fill?: string // 'FFRRGGBB' or 'RRGGBB'
  align?: 'left' | 'center'
  valign?: 'center'
  borderBottomColor?: string
}

export interface XlsxCell {
  col: number // 1-based
  value: string | number
  style?: XlsxCellStyle
}

export interface XlsxRow {
  cells: XlsxCell[]
  height?: number
}

export interface XlsxSheetSpec {
  columnWidths: number[]
  rows: XlsxRow[]
  merges?: string[]
  freezeRows?: number
  autoFilterRange?: string
}

function normalizeColor(color?: string): string | undefined {
  if (!color) return undefined
  return color.length === 6 ? `FF${color}` : color
}

function colLetter(n: number): string {
  let s = ''
  let num = n
  while (num > 0) {
    const rem = (num - 1) % 26
    s = String.fromCharCode(65 + rem) + s
    num = Math.floor((num - 1) / 26)
  }
  return s
}

export function buildXlsx(sheet: XlsxSheetSpec): Buffer {
  const styles = new StyleRegistry()

  const rowsXml = sheet.rows
    .map((row, rowIndex) => {
      const r = rowIndex + 1
      const cellsXml = row.cells
        .map((cell) => {
          const ref = `${colLetter(cell.col)}${r}`
          const style = cell.style
          const styleId = style
            ? styles.register({
                size: style.size,
                bold: style.bold,
                italic: style.italic,
                color: normalizeColor(style.color),
                fill: normalizeColor(style.fill),
                align: style.align,
                valign: style.valign,
                borderBottomColor: normalizeColor(style.borderBottomColor)
              })
            : 0
          if (typeof cell.value === 'number') {
            return `<c r="${ref}" s="${styleId}"><v>${cell.value}</v></c>`
          }
          return `<c r="${ref}" s="${styleId}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(cell.value)}</t></is></c>`
        })
        .join('')
      const heightAttr = row.height ? ` ht="${row.height}" customHeight="1"` : ''
      return `<row r="${r}"${heightAttr}>${cellsXml}</row>`
    })
    .join('')

  const colsXml = sheet.columnWidths
    .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`)
    .join('')

  const mergesXml = sheet.merges && sheet.merges.length
    ? `<mergeCells count="${sheet.merges.length}">${sheet.merges.map((m) => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>`
    : ''

  const paneXml = sheet.freezeRows
    ? `<pane ySplit="${sheet.freezeRows}" topLeftCell="A${sheet.freezeRows + 1}" activePane="bottomLeft" state="frozen"/>`
    : ''

  const autoFilterXml = sheet.autoFilterRange ? `<autoFilter ref="${sheet.autoFilterRange}"/>` : ''

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView workbookViewId="0">${paneXml}</sheetView></sheetViews>
<cols>${colsXml}</cols>
<sheetData>${rowsXml}</sheetData>
${autoFilterXml}
${mergesXml}
</worksheet>`

  // Style registry must be fully populated (every cell registered) before
  // styles.xml is serialized, since cell styleIds reference it by index -
  // rowsXml above is built first for exactly this reason.
  const stylesXml = styles.toXml()

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Guest List" sheetId="1" r:id="rId1"/></sheets>
</workbook>`

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`

  const entries: ZipEntry[] = [
    { name: '[Content_Types].xml', data: Buffer.from(contentTypesXml, 'utf8') },
    { name: '_rels/.rels', data: Buffer.from(rootRelsXml, 'utf8') },
    { name: 'xl/workbook.xml', data: Buffer.from(workbookXml, 'utf8') },
    { name: 'xl/_rels/workbook.xml.rels', data: Buffer.from(workbookRelsXml, 'utf8') },
    { name: 'xl/styles.xml', data: Buffer.from(stylesXml, 'utf8') },
    { name: 'xl/worksheets/sheet1.xml', data: Buffer.from(sheetXml, 'utf8') }
  ]

  return buildZip(entries)
}
