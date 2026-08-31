import { PORTFOLIO_INDEX_HTML } from '../../generated/portfolio-index'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  return PORTFOLIO_INDEX_HTML
})
