import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router';
import { Compass, Home, Layers, Plus, Shirt, User } from 'lucide-react';
import { useCurrentUser } from '../../store/selectors';
import { STORAGE_ERROR_EVENT } from '../../store/useStore';
import { ErrorBoundary } from '../ErrorBoundary';
import { Button } from '../ui/Button';

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/projects', label: 'Projects', icon: Layers, end: false },
  { to: '/materials', label: 'Materials', icon: Shirt, end: false },
  { to: '/explore', label: 'Explore', icon: Compass, end: false },
  { to: '/profile', label: 'Profile', icon: User, end: false },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-mono text-base font-bold uppercase tracking-[0.2em]">
      <span aria-hidden className="inline-block h-3 w-3 bg-ink" />
      CasaVirou
    </Link>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RoutedOutlet() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>
      <Outlet />
    </ErrorBoundary>
  );
}

function StorageErrorBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = () => setVisible(true);
    window.addEventListener(STORAGE_ERROR_EVENT, show);
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, show);
  }, []);
  if (!visible) return null;
  return (
    <div role="alert" className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 bg-red-800 px-4 py-3 text-sm text-white">
      <span>Storage is full, so your last change may not be saved. Try removing a few photos.</span>
      <button type="button" onClick={() => setVisible(false)} className="eyebrow underline">
        Dismiss
      </button>
    </div>
  );
}

function SignedInHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-10">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `eyebrow px-3 py-2 transition-colors ${isActive ? 'bg-ink text-paper' : 'text-ink hover:bg-ink/5'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button to="/materials/new" size="sm">
            <Plus className="h-3.5 w-3.5" /> Add Material
          </Button>
        </div>
        <Link
          to="/materials/new"
          aria-label="Add material"
          className="flex h-10 w-10 items-center justify-center border border-ink transition-all hover:bg-ink hover:text-paper md:hidden"
        >
          <Plus className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid grid-cols-5">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                isActive ? 'bg-ink text-paper' : 'text-ink hover:bg-ink/5'
              }`
            }
          >
            <n.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            {n.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function SignedOutHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-10">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
          <NavLink
            to="/explore"
            className={({ isActive }) => `eyebrow hidden px-3 py-2 sm:inline ${isActive ? 'underline underline-offset-4' : 'hover:underline hover:underline-offset-4'}`}
          >
            Explore
          </NavLink>
          <NavLink to="/signin" className="eyebrow px-2 py-2 hover:underline hover:underline-offset-4 sm:px-3">
            Sign in
          </NavLink>
          <Button to="/signup" size="sm">
            Get started
          </Button>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-10">
        <p className="eyebrow text-muted">CasaVirou · Use what exists</p>
        <p className="eyebrow text-muted">Transform it · Extend its life · Share knowledge</p>
      </div>
    </footer>
  );
}

export function AppLayout() {
  const user = useCurrentUser();
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <StorageErrorBanner />
      {user ? <SignedInHeader /> : <SignedOutHeader />}
      <main className={`flex-1 ${user ? 'pb-20 md:pb-0' : ''}`}>
        <RoutedOutlet />
      </main>
      <div className={user ? 'hidden md:block' : ''}>
        <Footer />
      </div>
      {user && <BottomNav />}
    </div>
  );
}

/** Task Focus Mode: no header, footer, or navigation. */
export function FocusLayout() {
  return (
    <div className="min-h-dvh">
      <ScrollToTop />
      <StorageErrorBanner />
      <RoutedOutlet />
    </div>
  );
}

export function RequireAuth() {
  const user = useCurrentUser();
  const location = useLocation();
  if (!user) return <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

export function Page({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return (
    <div className={`mx-auto px-4 pt-8 sm:px-6 sm:pt-12 lg:px-10 ${narrow ? 'max-w-3xl' : 'max-w-7xl'}`}>{children}</div>
  );
}

export function FocusBar({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-20 border-b border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        {left}
        {right}
      </div>
    </div>
  );
}
