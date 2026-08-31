/**
 * Minimal hand-written ambient types for the `page-flip` package (the
 * successor to StPageFlip). The package ships no .d.ts of its own, and
 * DefinitelyTyped's @types/page-flip trails the real API closely enough to
 * risk drift - this only declares the exact surface DetailsBookFlip.vue
 * actually calls, kept intentionally small.
 */
declare module 'page-flip' {
  export interface PageFlipSettings {
    width: number
    height: number
    size?: 'fixed' | 'stretch'
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    showCover?: boolean
    usePortrait?: boolean
    mobileScrollSupport?: boolean
    flippingTime?: number
    maxShadowOpacity?: number
    useMouseEvents?: boolean
    swipeDistance?: number
    drawShadow?: boolean
    disableFlipByClick?: boolean
  }

  export interface PageFlipEvent {
    data: number
    object: unknown
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: Partial<PageFlipSettings>)
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void
    updateFromHtml(items: NodeListOf<HTMLElement> | HTMLElement[]): void
    flipNext(corner?: 'top' | 'bottom'): void
    flipPrev(corner?: 'top' | 'bottom'): void
    turnToPage(pageNum: number): void
    getCurrentPageIndex(): number
    getPageCount(): number
    destroy(): void
    on(event: 'flip' | 'changeOrientation' | 'changeState' | 'init' | 'update', callback: (e: PageFlipEvent) => void): void
  }
}
