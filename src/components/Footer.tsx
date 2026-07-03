import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import keikolMark from "@/assets/Logo.png";

function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2">
      <img
        src={keikolMark}
        alt="Keikol Media Group logo"
        className="h-8 w-8 rounded-lg shadow-gold"
      />
      <span className="font-display text-xl font-extrabold tracking-tight">Keikol</span>
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="print:hidden border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Keikol is a modern advertising and media brand helping businesses grow through premium
              billboard placements, outdoor media, and future technology-driven campaign solutions.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Linkedin, label: "LinkedIn" },
                { Icon: Facebook, label: "Facebook" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Quick Links"
            links={[
              { label: "Home", to: "/" },
              { label: "Locations", to: "/locations" },
              { label: "Industries", to: "/industries" },
              { label: "Campaign Ideas", to: "/portfolio" },
              { label: "About", to: "/about" },
              { label: "Contact", to: "/contact" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: "Privacy Policy", to: "/privacy-policy" },
              { label: "Terms of Use", to: "/terms-of-use" },
            ]}
          />

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-widest">Contact</h4>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:info@keikol.com" className="hover:text-gold">
                  info@keikol.com
                </a>
              </li>
              <li>
                <a href="tel:+234" className="hover:text-gold">
                  +234 XXX XXX XXXX
                </a>
              </li>
              <li>Nigeria</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© 2026 Keikol Media Ltd. All rights reserved.</p>
          <p>Built for brands that want to be seen.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="font-display text-sm font-bold uppercase tracking-widest">{title}</h4>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-gold"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
