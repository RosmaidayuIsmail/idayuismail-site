import { createClient } from '@libsql/client'

const portfolioDb = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
})

let schemaReady: Promise<void> | null = null

export function ensurePortfolioSchema() {
  if (schemaReady) return schemaReady
  schemaReady = (async () => {
    await portfolioDb.execute(`
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT NOT NULL,
        title TEXT,
        location TEXT,
        bio_en TEXT, bio_ko TEXT, bio_zh TEXT,
        tag_en TEXT, tag_ko TEXT, tag_zh TEXT,
        skills TEXT,
        email TEXT, whatsapp TEXT, instagram TEXT, linkedin TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `)
    await portfolioDb.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title_en TEXT, title_ko TEXT, title_zh TEXT,
        body_en TEXT, body_ko TEXT, body_zh TEXT,
        more_en TEXT, more_ko TEXT, more_zh TEXT,
        tags TEXT,
        link TEXT,
        images TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `)
    try { await portfolioDb.execute(`ALTER TABLE projects ADD COLUMN images TEXT`) } catch { /* column already exists */ }
    await portfolioDb.execute(`
      CREATE TABLE IF NOT EXISTS learning (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title_en TEXT, title_ko TEXT, title_zh TEXT,
        body_en TEXT, body_ko TEXT, body_zh TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `)
    await portfolioDb.execute(`
      CREATE TABLE IF NOT EXISTS journey (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        date TEXT,
        title_en TEXT, title_ko TEXT, title_zh TEXT,
        body_en TEXT, body_ko TEXT, body_zh TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `)
    await portfolioDb.execute(`
      CREATE TABLE IF NOT EXISTS moments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image TEXT,
        caption TEXT,
        likes INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `)
    try { await portfolioDb.execute(`ALTER TABLE moments ADD COLUMN likes INTEGER DEFAULT 0`) } catch { /* already exists */ }
    await portfolioDb.execute(`
      CREATE TABLE IF NOT EXISTS moment_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        moment_id INTEGER NOT NULL,
        name TEXT,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `)
    // Threaded replies: null = a top-level comment, otherwise the id of the
    // top-level comment it replies to. Replies are flattened to one level
    // (a reply to a reply still points at the original top-level comment),
    // matching Instagram's own comment UI - keeps both the query and the
    // rendering simple.
    try { await portfolioDb.execute(`ALTER TABLE moment_comments ADD COLUMN parent_id INTEGER`) } catch { /* already exists */ }
    await portfolioDb.execute(`
      CREATE TABLE IF NOT EXISTS site_text (
        key TEXT PRIMARY KEY,
        value_en TEXT, value_ko TEXT, value_zh TEXT
      );
    `)
    await portfolioDb.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        glyph TEXT,
        title_en TEXT, title_ko TEXT, title_zh TEXT,
        body_en TEXT, body_ko TEXT, body_zh TEXT,
        sort_order INTEGER DEFAULT 0
      );
    `)
    await portfolioDb.execute(`
      CREATE TABLE IF NOT EXISTS certifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text_en TEXT, text_ko TEXT, text_zh TEXT,
        sort_order INTEGER DEFAULT 0
      );
    `)
    await seedSiteTextDefaults()
  })()
  return schemaReady
}

// One-time seed so migrating to DB-backed UI text/services/certifications
// never regresses the live site to blank fields - INSERT OR IGNORE means
// this is a no-op once a row already exists (whether from this seed or a
// later admin edit). Values transcribed from the previous hardcoded source,
// portfolio/src/data/content.js's UI.en/ko/zh - that file now only serves
// as a fallback if these tables are ever empty (see App.jsx's ui.t merge).
async function seedSiteTextDefaults() {
  // Flat [key, en, ko, zh] tuples - see content.js for the source values.
  const TEXT: Array<[string, string, string, string]> = [
    ['nav.about', 'About', '소개', '关于'],
    ['nav.work', 'Work', '작업', '作品'],
    ['nav.journey', 'Journey', '여정', '历程'],
    ['nav.learning', 'Learning', '배움', '学习'],
    ['nav.services', 'Services', '서비스', '服务'],
    ['nav.contact', 'Contact', '연락처', '联系'],
    ['scroll', 'Scroll', '스크롤', '向下滚动'],
    ['heroCtaPrimary', 'See my work', '작업 보기', '查看作品'],
    ['heroCtaSecondary', 'Get in touch', '연락하기', '联系我'],
    ['vertical', '언제나 기억해요', '언제나 기억해요', '永远记住 你并不孤单'],
    ['aboutLabel', 'About', '소개', '关于'],
    ['skillsLabel', 'Tools & languages', '도구 & 언어', '工具与语言'],
    ['workLabel', 'Work', '작업', '作品'],
    ['workSub', 'Selected projects — 精選', '선정 프로젝트 — 精選', '精选项目'],
    ['workExpand', 'Expand', '펼치기', '展开'],
    ['workClose', 'Close', '닫기', '收起'],
    ['workVisit', 'Visit live site', '사이트 방문', '访问网站'],
    ['backToWork', 'Back to work', '작업으로 돌아가기', '返回作品'],
    ['journeyLabel', 'Journey', '여정', '历程'],
    ['journeySub', 'Latest updates — 历程', '최신 소식 — 历程', '最新动态 — 历程'],
    ['momentsLabel', 'Moments', '모먼트', '近况'],
    ['momentsSub', 'Recent — 近况', '최근 — 近况', '最近动态 — 近况'],
    ['learningLabel', 'Learning', '배움', '学习'],
    ['learningSub', 'Currently sharpening — 学习', '지금 다듬고 있는 것 — 学习', '正在打磨 — 学习'],
    ['certLabel', 'Certifications', '자격증 & 워크숍', '认证与工作坊'],
    ['servicesLabel', 'Services', '서비스', '服务'],
    ['servicesSub', 'Open for — 合作', '협업 가능 — 合作', '可提供 — 合作'],
    ['cta', 'Get in touch', '연락하기', '联系我'],
    ['contactLabel', 'Contact', '연락처', '联系'],
    ['contactSub', "Let's talk — 联系", '이야기해요 — 联系', '开始聊聊 — 联系'],
    ['contactHeading', 'Have a project in mind?', '함께할 프로젝트가 있으신가요?', '有项目想聊聊吗？'],
    ['sealQuote', "Design is more than how it looks — it's how it works, and how it makes people feel.", '디자인은 겉모습이 전부가 아니라, 어떻게 작동하고 사람들에게 어떤 느낌을 주는지입니다.', '设计不只是外观 — 更在于它如何运作，以及带给人们怎样的感受。'],
    ['footerLinkLabels.email', 'Email', '이메일', '邮箱'],
    ['footerLinkLabels.whatsapp', 'WhatsApp', 'WhatsApp', 'WhatsApp'],
    ['footerLinkLabels.instagram', 'Instagram', '인스타그램', 'Instagram'],
    ['footerLinkLabels.linkedin', 'LinkedIn', 'LinkedIn', 'LinkedIn'],
    ['footerNote', 'Open to remote work worldwide.', '전 세계 원격 근무 가능합니다.', '可远程为全球客户工作。'],
    ['loading', 'Loading…', '불러오는 중…', '加载中…'],
    ['notFound', 'Not found.', '찾을 수 없습니다.', '未找到。'],
  ]
  for (const [key, en, ko, zh] of TEXT) {
    await portfolioDb.execute({
      sql: 'INSERT OR IGNORE INTO site_text (key, value_en, value_ko, value_zh) VALUES (?, ?, ?, ?)',
      args: [key, en, ko, zh],
    })
  }

  const SERVICES: Array<[string, string, string, string, string, string, string]> = [
    ['画', 'UI/UX Design', 'UI/UX 디자인', 'UI/UX 设计',
      'Wireframes to polished, accessible interfaces — in Figma, built with intent.',
      '와이어프레임부터 완성도 높은 접근성 인터페이스까지, Figma로 의도를 담아 작업합니다.',
      '从线框图到打磨完善、注重无障碍的界面 — 在 Figma 中用心设计。'],
    ['文', 'Frontend Development', '프론트엔드 개발', '前端开发',
      'Vue, Nuxt 3, and Tailwind builds that match the design, pixel for pixel.',
      '디자인과 픽셀 단위로 일치하는 Vue, Nuxt 3, Tailwind 빌드.',
      '与设计逐像素还原的 Vue、Nuxt 3、Tailwind 开发。'],
    ['策', 'Freelance & Remote', '프리랜스 & 원격', '自由职业与远程',
      'Open to remote UI/UX and frontend roles, and freelance design work.',
      '원격 UI/UX·프론트엔드 포지션과 프리랜스 디자인 작업에 열려 있습니다.',
      '欢迎远程 UI/UX 与前端职位，也接自由设计项目。'],
  ]
  const existingServices = await portfolioDb.execute('SELECT COUNT(*) as n FROM services')
  if (((existingServices.rows[0] as any)?.n ?? 0) === 0) {
    for (let i = 0; i < SERVICES.length; i++) {
      const [glyph, titleEn, titleKo, titleZh, bodyEn, bodyKo, bodyZh] = SERVICES[i]!
      await portfolioDb.execute({
        sql: `INSERT INTO services (glyph, title_en, title_ko, title_zh, body_en, body_ko, body_zh, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [glyph, titleEn, titleKo, titleZh, bodyEn, bodyKo, bodyZh, i],
      })
    }
  }

  const CERTS: Array<[string, string, string]> = [
    ['Flutter Workshop', 'Flutter 워크숍', 'Flutter 工作坊'],
    ['Angular Fundamentals', 'Angular 기초', 'Angular 基础'],
    ['Zoolunteer Project', 'Zoolunteer 프로젝트', 'Zoolunteer 项目'],
  ]
  const existingCerts = await portfolioDb.execute('SELECT COUNT(*) as n FROM certifications')
  if (((existingCerts.rows[0] as any)?.n ?? 0) === 0) {
    for (let i = 0; i < CERTS.length; i++) {
      const [en, ko, zh] = CERTS[i]!
      await portfolioDb.execute({
        sql: 'INSERT INTO certifications (text_en, text_ko, text_zh, sort_order) VALUES (?, ?, ?, ?)',
        args: [en, ko, zh, i],
      })
    }
  }
}

export default portfolioDb
