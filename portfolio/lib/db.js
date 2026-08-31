import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
})

let schemaReady = null

export async function ensureSchema() {
  if (schemaReady) return schemaReady
  schemaReady = (async () => {
    await client.execute(`
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
    await client.execute(`
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
    try { await client.execute(`ALTER TABLE projects ADD COLUMN images TEXT`) } catch (e) { /* column already exists */ }
    await client.execute(`
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
    await client.execute(`
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
    await client.execute(`
      CREATE TABLE IF NOT EXISTS moments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image TEXT,
        caption TEXT,
        likes INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `)
    try { await client.execute(`ALTER TABLE moments ADD COLUMN likes INTEGER DEFAULT 0`) } catch (e) { /* already exists */ }
    await client.execute(`
      CREATE TABLE IF NOT EXISTS moment_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        moment_id INTEGER NOT NULL,
        name TEXT,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `)
  })()
  return schemaReady
}

export default client
