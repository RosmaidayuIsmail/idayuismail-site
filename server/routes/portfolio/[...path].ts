// SPA fallback: deep links inside the portfolio (e.g. /portfolio/admin)
// must serve the React app's index.html. The HTML is bundled into the server
// build so it also works on serverless deploys where public/ files aren't on disk.
import { PORTFOLIO_INDEX_HTML } from '../../generated/portfolio-index'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  return PORTFOLIO_INDEX_HTML
})
