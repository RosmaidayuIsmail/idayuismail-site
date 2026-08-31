import client, { ensureSchema } from '../lib/db.js'

const profile = {
  name: 'Rosmaidayu Ismail',
  title: 'UI/UX Engineer',
  location: 'Terengganu, Malaysia',
  bio_en: "I'm Rosmaidayu — a Computer Science (Hons.) graduate in Multimedia Computing from UiTM, based in Terengganu, Malaysia. I design and build interfaces that are as functional as they are pleasant to use.",
  bio_ko: '저는 Rosmaidayu, 말레이시아 트렝가누 출신으로 UiTM에서 멀티미디어 컴퓨팅을 전공한 컴퓨터공학(우등) 졸업생입니다. 기능적이면서도 사용하기 즐거운 인터페이스를 디자인하고 만듭니다.',
  bio_zh: '我是 Rosmaidayu，来自马来西亚登嘉楼，毕业于 UiTM 多媒体计算专业的计算机科学（荣誉）学位。我设计并开发既实用又令人愉悦的界面。',
  tag_en: 'Computer Science graduate crafting clean, accessible interfaces.',
  tag_ko: '깔끔하고 접근성 높은 인터페이스를 만드는 컴퓨터공학 졸업생.',
  tag_zh: '计算机科学毕业生，专注打造简洁、无障碍的界面。',
  skills: ['Figma', 'Vue.js', 'Nuxt 3', 'JavaScript', 'Tailwind CSS', 'Flutter', 'Firebase', 'PHP', 'MySQL', 'Unity', 'Blender', 'C++'],
  email: 'ismailrosmaidayu@gmail.com',
  whatsapp: 'https://wa.me/60196641505',
  instagram: 'https://www.instagram.com/idayu.is/',
  linkedin: 'https://www.linkedin.com/in/rosmaidayu-ismail-37b836229/',
}

const projects = [
  {
    slug: 'portfolio-v2',
    title: { en: 'Portfolio, Version Two', ko: '포트폴리오 2번째 버전', zh: '作品集 第二版' },
    body: {
      en: 'A full redesign of my own portfolio — Nuxt 3, Tailwind, and animated dark/light sections.',
      ko: '제 포트폴리오를 처음부터 다시 만든 버전 — Nuxt 3, Tailwind, 다크/라이트 모드 애니메이션.',
      zh: '我个人作品集的全面重新设计 — 使用 Nuxt 3、Tailwind，并带有明暗模式动画。',
    },
    more: {
      en: 'Rebuilt from the ground up with a stronger visual system and smoother motion than my first version.',
      ko: '이전 버전보다 더 강한 비주얼 시스템과 부드러운 모션으로 완전히 재구축했습니다.',
      zh: '从零开始重建，视觉系统更强，动效也比第一版更流畅。',
    },
    tags: ['Nuxt 3', 'Tailwind'], link: 'https://portfolio-v2-kappa-ten.vercel.app/',
    images: ['https://rosmaidayu-portfolio.web.app/rosmaidayu-portfolio.png'], sortOrder: 1,
  },
  {
    slug: 'event-rsvp-platform',
    title: { en: 'Event RSVP Platform', ko: '이벤트 RSVP 플랫폼', zh: '活动 RSVP 平台' },
    body: {
      en: 'An online wedding-invitation and RSVP system built with Nuxt 3 and Firebase.',
      ko: 'Nuxt 3와 Firebase로 만든 온라인 청첩장 및 RSVP 시스템.',
      zh: '使用 Nuxt 3 和 Firebase 构建的在线婚礼请柬与 RSVP 系统。',
    },
    more: {
      en: 'Focused on smooth form handling, routing, and a guest experience that feels personal, not like a form.',
      ko: '폼 처리, 라우팅, 그리고 형식적이지 않고 개인적으로 느껴지는 하객 경험에 집중했습니다.',
      zh: '专注于流畅的表单处理、路由设计，以及让宾客感到用心而非公式化的体验。',
    },
    tags: ['Nuxt 3', 'Firebase'], link: 'https://weddingcard-public.vercel.app/',
    images: ['https://rosmaidayu-portfolio.web.app/nuxt3-rsvp-vercel-app.png'], sortOrder: 2,
  },
  {
    slug: 'mycomel',
    title: { en: 'MyComel — Child Development System', ko: 'MyComel — 아동 발달 시스템', zh: 'MyComel — 儿童发展系统' },
    body: {
      en: 'An internship project I inherited and carried to completion: a monitoring system for parents, doctors, nurses, and health officers.',
      ko: '다른 인턴이 시작한 프로젝트를 이어받아 완성한 인턴십 프로젝트 — 부모, 의사, 간호사, 보건 담당자를 위한 모니터링 시스템.',
      zh: '接手并完成的实习项目：为家长、医生、护士和卫生官员打造的监测系统。',
    },
    more: {
      en: "Built with PHP, MySQL, and role-based logins — my first real experience finishing someone else's codebase.",
      ko: 'PHP, MySQL, 역할 기반 로그인으로 구축 — 다른 사람의 코드베이스를 처음으로 완성해 본 경험이었습니다.',
      zh: '使用 PHP、MySQL 与基于角色的登录构建 — 这是我第一次真正完成他人留下的代码库。',
    },
    tags: ['PHP', 'MySQL'], link: null,
    images: ['https://rosmaidayu-portfolio.web.app/MyComel%20System.png'], sortOrder: 3,
  },
  {
    slug: 'diabetes-management-app',
    title: { en: 'Diabetes Management App', ko: '당뇨 관리 앱', zh: '糖尿病管理应用' },
    body: {
      en: 'A Flutter and Firebase mobile app for tracking diabetes management, built for my final year project.',
      ko: '졸업 작품으로 만든 당뇨 관리 추적용 Flutter・Firebase 모바일 앱.',
      zh: '为毕业设计打造的 Flutter、Firebase 糖尿病管理追踪移动应用。',
    },
    more: {
      en: 'Included a 3D interface exploration to test how spatial design could make a health app easier to stick with.',
      ko: '공간 디자인이 건강 앱을 꾸준히 쓰게 만드는지 실험하기 위해 3D 인터페이스도 탐구했습니다.',
      zh: '还探索了 3D 界面，测试空间化设计能否让健康类应用更容易坚持使用。',
    },
    tags: ['Flutter', 'Firebase'], link: null,
    images: ['https://rosmaidayu-portfolio.web.app/3.png', 'https://rosmaidayu-portfolio.web.app/1.png'], sortOrder: 4,
  },
  {
    slug: 'cybersecurity-dashboard',
    title: { en: 'Cybersecurity Intelligence Dashboard', ko: '사이버보안 인텔리전스 대시보드', zh: '网络安全智能仪表盘' },
    body: {
      en: 'An interactive compliance-analytics dashboard mock-up, designed during my internship at MyOne Corporation.',
      ko: 'MyOne Corporation 인턴십 중 설계한 컴플라이언스 분석 대시보드 목업.',
      zh: '在 MyOne Corporation 实习期间设计的合规分析仪表盘原型。',
    },
    more: {
      en: 'Filters, charts, and data views designed for people who need answers fast, not a wall of numbers.',
      ko: '숫자의 벽이 아니라, 빠르게 답을 찾아야 하는 사람들을 위한 필터와 차트, 데이터 뷰.',
      zh: '为需要快速找到答案而非面对数字墙的人设计的筛选器、图表与数据视图。',
    },
    tags: ['Figma', 'Dashboard UI'], link: null,
    images: ['https://rosmaidayu-portfolio.web.app/cybersecurity.png'], sortOrder: 5,
  },
  {
    slug: 'hydration-tracker',
    title: { en: 'Hydration Tracker', ko: '수분 섭취 트래커', zh: '饮水追踪器' },
    body: {
      en: 'A small Vue/Nuxt utility app for tracking daily water intake.',
      ko: '하루 물 섭취량을 기록하는 작은 Vue・Nuxt 유틸리티 앱.',
      zh: '一个记录每日饮水量的小型 Vue、Nuxt 工具应用。',
    },
    more: {
      en: 'A compact exercise in clean state management and an interface that stays out of your way.',
      ko: '깔끔한 상태 관리와 방해되지 않는 인터페이스를 연습한 작업입니다.',
      zh: '一次关于简洁状态管理和不打扰用户的界面的练习。',
    },
    tags: ['Vue', 'Nuxt'], link: 'https://hydration-tracker-two.vercel.app/', sortOrder: 6,
  },
]

const learning = [
  {
    slug: 'vuejs',
    title: { en: 'Vue.js', ko: 'Vue.js', zh: 'Vue.js' },
    body: {
      en: 'Composables, lifecycle hooks, and building things the composition-API way.',
      ko: '컴포저블, 라이프사이클 훅, 컴포지션 API 방식으로 만들기.',
      zh: '组合式函数、生命周期钩子，以 Composition API 的方式构建应用。',
    },
    sortOrder: 1,
  },
  {
    slug: 'nuxt-3',
    title: { en: 'Nuxt 3', ko: 'Nuxt 3', zh: 'Nuxt 3' },
    body: {
      en: 'Server-side rendering, file-based routing, and pairing it with Firebase.',
      ko: '서버사이드 렌더링, 파일 기반 라우팅, Firebase와의 연동.',
      zh: '服务端渲染、基于文件的路由，以及与 Firebase 的搭配使用。',
    },
    sortOrder: 2,
  },
  {
    slug: 'nuxt-ui',
    title: { en: 'Nuxt UI', ko: 'Nuxt UI', zh: 'Nuxt UI' },
    body: {
      en: 'Building fully modern layouts without reinventing every component from scratch.',
      ko: '모든 컴포넌트를 처음부터 다시 만들지 않고도 모던한 레이아웃 구축하기.',
      zh: '无需从零打造每个组件，也能构建现代化的页面布局。',
    },
    sortOrder: 3,
  },
]

const journey = [
  {
    slug: 'graduated-bachelor',
    date: 'Jan 2025',
    title: { en: 'Graduated — B.CS (Hons.) Multimedia Computing', ko: '졸업 — 컴퓨터공학(우등) 멀티미디어 컴퓨팅', zh: '毕业 — 计算机科学（荣誉）多媒体计算学位' },
    body: {
      en: 'Completed my Bachelor of Computer Science (Hons.) in Multimedia Computing at UiTM.',
      ko: 'UiTM에서 멀티미디어 컴퓨팅 전공으로 컴퓨터공학(우등) 학사 학위를 마쳤습니다.',
      zh: '在 UiTM 完成了多媒体计算专业的计算机科学（荣誉）学士学位。',
    },
    sortOrder: 1,
  },
  {
    slug: 'myone-internship',
    date: 'Sep 2024 – Jan 2025',
    title: { en: 'Internship — MyOne Corporation', ko: '인턴십 — MyOne Corporation', zh: '实习 — MyOne Corporation' },
    body: {
      en: 'Designed a mock-up dashboard for a Cybersecurity Intelligence Data Platform.',
      ko: '사이버보안 인텔리전스 데이터 플랫폼을 위한 목업 대시보드를 설계했습니다.',
      zh: '为网络安全智能数据平台设计了原型仪表盘。',
    },
    sortOrder: 2,
  },
  {
    slug: 'uitm-internship',
    date: 'Apr 2022 – Aug 2022',
    title: { en: 'Internship — UiTM Terengganu', ko: '인턴십 — UiTM 트렝가누', zh: '实习 — UiTM 登嘉楼' },
    body: {
      en: 'Developed the MyComel child development monitoring system using PHP, MySQL, and JavaScript.',
      ko: 'PHP, MySQL, JavaScript를 사용해 MyComel 아동 발달 모니터링 시스템을 개발했습니다.',
      zh: '使用 PHP、MySQL 和 JavaScript 开发了 MyComel 儿童发展监测系统。',
    },
    sortOrder: 3,
  },
  {
    slug: 'graduated-diploma',
    date: 'Sep 2022',
    title: { en: 'Graduated — Diploma in Computer Science', ko: '졸업 — 컴퓨터공학 디플로마', zh: '毕业 — 计算机科学文凭' },
    body: {
      en: 'Completed my Diploma in Computer Science at UiTM, the foundation before continuing into the degree program.',
      ko: 'UiTM에서 컴퓨터공학 디플로마를 마치고 학위 과정으로 이어졌습니다.',
      zh: '在 UiTM 完成计算机科学文凭课程，随后升读学士学位。',
    },
    sortOrder: 4,
  },
]

async function seed() {
  await ensureSchema()

  await client.execute({
    sql: `INSERT INTO profile (id, name, title, location, bio_en, bio_ko, bio_zh, tag_en, tag_ko, tag_zh, skills, email, whatsapp, instagram, linkedin)
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name=excluded.name, title=excluded.title, location=excluded.location,
            bio_en=excluded.bio_en, bio_ko=excluded.bio_ko, bio_zh=excluded.bio_zh,
            tag_en=excluded.tag_en, tag_ko=excluded.tag_ko, tag_zh=excluded.tag_zh,
            skills=excluded.skills, email=excluded.email, whatsapp=excluded.whatsapp,
            instagram=excluded.instagram, linkedin=excluded.linkedin`,
    args: [
      profile.name, profile.title, profile.location, profile.bio_en, profile.bio_ko, profile.bio_zh,
      profile.tag_en, profile.tag_ko, profile.tag_zh, JSON.stringify(profile.skills),
      profile.email, profile.whatsapp, profile.instagram, profile.linkedin,
    ],
  })
  console.log('✓ profile seeded')

  for (const p of projects) {
    await client.execute({
      sql: `INSERT INTO projects (slug, title_en, title_ko, title_zh, body_en, body_ko, body_zh, more_en, more_ko, more_zh, tags, link, images, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
              title_en=excluded.title_en, title_ko=excluded.title_ko, title_zh=excluded.title_zh,
              body_en=excluded.body_en, body_ko=excluded.body_ko, body_zh=excluded.body_zh,
              more_en=excluded.more_en, more_ko=excluded.more_ko, more_zh=excluded.more_zh,
              tags=excluded.tags, link=excluded.link, images=excluded.images, sort_order=excluded.sort_order`,
      args: [
        p.slug, p.title.en, p.title.ko, p.title.zh, p.body.en, p.body.ko, p.body.zh,
        p.more.en, p.more.ko, p.more.zh, JSON.stringify(p.tags), p.link, JSON.stringify(p.images || []), p.sortOrder,
      ],
    })
  }
  console.log(`✓ ${projects.length} projects seeded`)

  for (const l of learning) {
    await client.execute({
      sql: `INSERT INTO learning (slug, title_en, title_ko, title_zh, body_en, body_ko, body_zh, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
              title_en=excluded.title_en, title_ko=excluded.title_ko, title_zh=excluded.title_zh,
              body_en=excluded.body_en, body_ko=excluded.body_ko, body_zh=excluded.body_zh,
              sort_order=excluded.sort_order`,
      args: [l.slug, l.title.en, l.title.ko, l.title.zh, l.body.en, l.body.ko, l.body.zh, l.sortOrder],
    })
  }
  console.log(`✓ ${learning.length} learning entries seeded`)

  for (const j of journey) {
    await client.execute({
      sql: `INSERT INTO journey (slug, date, title_en, title_ko, title_zh, body_en, body_ko, body_zh, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
              date=excluded.date, title_en=excluded.title_en, title_ko=excluded.title_ko, title_zh=excluded.title_zh,
              body_en=excluded.body_en, body_ko=excluded.body_ko, body_zh=excluded.body_zh,
              sort_order=excluded.sort_order`,
      args: [j.slug, j.date, j.title.en, j.title.ko, j.title.zh, j.body.en, j.body.ko, j.body.zh, j.sortOrder],
    })
  }
  console.log(`✓ ${journey.length} journey entries seeded`)
  console.log('Done.')
}

seed().catch((e) => { console.error(e); process.exit(1) })
