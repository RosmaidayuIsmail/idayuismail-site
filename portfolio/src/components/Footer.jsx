import { Mail, MessageCircle, Instagram, Linkedin } from 'lucide-react'
import Roman from './Roman'
import './Footer.css'

export default function Footer({ ui, profile }) {
  if (!profile) return null

  const links = [
    { key: 'email', label: ui.t.footerLinkLabels.email, href: `mailto:${profile.email}`, Icon: Mail },
    { key: 'whatsapp', label: ui.t.footerLinkLabels.whatsapp, href: profile.whatsapp, Icon: MessageCircle },
    { key: 'instagram', label: ui.t.footerLinkLabels.instagram, href: profile.instagram, Icon: Instagram },
    { key: 'linkedin', label: ui.t.footerLinkLabels.linkedin, href: profile.linkedin, Icon: Linkedin },
  ].filter((l) => l.href)

  return (
    <footer id="contact" className="site-footer">
      <div className="wrap">
        <div className="section-head">
          <h2>{ui.t.contactLabel}</h2>
          <span>{ui.t.contactSub}</span>
        </div>

        <Roman as="h3" text={ui.t.contactHeading} lang={ui.lang} show={ui.showRoman} className="footer-heading" />

        <div className="footer-links">
          {links.map(({ key, label, href, Icon }) => (
            <a key={key} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
              <Icon size={20} />
              <Roman as="span" text={label} lang={ui.lang} show={ui.showRoman} />
            </a>
          ))}
        </div>

        <p className="footer-note">{profile.location} — {ui.t.footerNote}</p>
      </div>
    </footer>
  )
}
