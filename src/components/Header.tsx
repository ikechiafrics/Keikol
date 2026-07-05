import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  X,
} from "lucide-react";

import keikolMark from "@/assets/Logo.png";
import { useAuth } from "@/lib/auth-context";

// Grouped under one "Services" nav item rather than each living at the top
// level — keeps the nav from growing a new flat link every time a service is
// added (billboards, photography today; more media lines later).
const SERVICES = [
  { label: "Billboards", to: "/locations" },
  { label: "Photography & Videography", to: "/photographers" },
] as const;

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

function Logo() {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5">
      <img
        src={keikolMark}
        alt="Keikol — Billboard Advertising"
        className="h-12 w-12 rounded-xl shadow-gold"
      />
      <span className="font-display text-2xl font-extrabold tracking-tight">Keikol</span>
    </Link>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const { user, isAdmin, signOutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function onSignOut() {
    await signOutUser();
    navigate({ to: "/" });
  }

  return (
    <header
      className={`print:hidden fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "bg-background/40 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
            className="text-sm font-medium transition-colors"
          >
            Home
          </Link>
          {/* Pure CSS hover dropdown — no JS open/close state, so there's
              nothing to race or flicker. The invisible padding bridge
              (pt-2 on the panel wrapper) keeps the gap between trigger and
              panel inside the same hoverable box, so moving the cursor
              straight down from "Services" into the panel never exits the
              group and re-triggers a hover-out. */}
          <div className="group relative">
            <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none">
              Services{" "}
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90" />
            </button>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="min-w-[220px] rounded-xl border border-border bg-card-premium p-1.5 shadow-elegant ring-hairline">
                {SERVICES.map((s) => (
                  <Link
                    key={s.to}
                    to={s.to}
                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-gold/10 hover:text-gold"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {NAV_LINKS.slice(1).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="text-sm font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-semibold hover:border-gold hover:text-gold"
                >
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
              <Link
                to="/dashboard"
                className="group inline-flex items-center overflow-hidden rounded-full border border-border bg-surface/60 px-3 py-2.5 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-xs group-hover:duration-1000">
                  Dashboard
                </span>
              </Link>
              <button
                onClick={onSignOut}
                aria-label="Sign out"
                className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:border-gold hover:text-gold"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              to="/sign-in"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-semibold hover:border-gold hover:text-gold"
            >
              Sign In
            </Link>
          )}
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
          >
            Request a Quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-surface text-foreground" }}
              inactiveProps={{
                className: "text-muted-foreground hover:bg-surface hover:text-foreground",
              }}
              className="rounded-lg px-3 py-3 text-sm font-medium"
            >
              Home
            </Link>
            <button
              onClick={() => setServicesExpanded((v) => !v)}
              className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              Services
              <ChevronRight
                className={`h-4 w-4 transition-transform duration-300 ${servicesExpanded ? "rotate-90" : ""}`}
              />
            </button>
            {servicesExpanded && (
              <div className="ml-2 flex flex-col gap-1 border-l border-border pl-3">
                {SERVICES.map((s) => (
                  <Link
                    key={s.to}
                    to={s.to}
                    onClick={() => setOpen(false)}
                    activeProps={{ className: "bg-surface text-foreground" }}
                    inactiveProps={{
                      className: "text-muted-foreground hover:bg-surface hover:text-foreground",
                    }}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
            {NAV_LINKS.slice(1).map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "bg-surface text-foreground" }}
                inactiveProps={{
                  className: "text-muted-foreground hover:bg-surface hover:text-foreground",
                }}
                className="rounded-lg px-3 py-3 text-sm font-medium"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold hover:border-gold hover:text-gold"
                  >
                    <Shield className="h-4 w-4" /> Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold hover:border-gold hover:text-gold"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    onSignOut();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-muted-foreground hover:border-gold hover:text-gold"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/sign-in"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold hover:border-gold hover:text-gold"
              >
                Sign In
              </Link>
            )}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-primary-foreground shadow-gold"
            >
              Request a Quote <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
