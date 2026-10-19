import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { DEMO_PASSWORD } from '../data/seed';
import { useCurrentUser } from '../store/selectors';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/fields';
import { Notice } from '../components/ui/primitives';

function AuthShell({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 pt-12 sm:pt-20">
      <h1 className="display mb-8 text-3xl sm:text-4xl">{title}</h1>
      {children}
      <p className="mt-8 border-t border-line pt-6 text-sm text-muted">{footer}</p>
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9._]{3,24}$/;

export function SignUp() {
  const user = useCurrentUser();
  const signUp = useStore((s) => s.signUp);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to="/" replace />;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!USERNAME_RE.test(form.username.trim())) next.username = '3–24 characters: letters, numbers, dots, underscores.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.';
    setErrors(next);
    setFormError(undefined);
    if (Object.keys(next).length) return;

    setBusy(true);
    const result = await signUp({ username: form.username, email: form.email, password: form.password });
    if (result.ok) {
      navigate('/welcome', { replace: true });
    } else {
      setBusy(false);
      setFormError(result.error);
    }
  };

  return (
    <AuthShell
      title="Create account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/signin" className="text-ink underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {formError && <Notice tone="error">{formError}</Notice>}
        <TextField label="Username" autoComplete="username" value={form.username} onChange={set('username')} error={errors.username} />
        <TextField label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <TextField label="Password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
        <TextField label="Confirm password" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" size="lg" disabled={busy} className="mt-2 w-full">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account
        </Button>
      </form>
    </AuthShell>
  );
}

export function SignIn() {
  const user = useCurrentUser();
  const signIn = useStore((s) => s.signIn);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Enter your email or username and password.');
      return;
    }
    setBusy(true);
    setError(undefined);
    if (await signIn(identifier, password)) {
      navigate(from, { replace: true });
    } else {
      setBusy(false);
      setError('That email/username and password don\u2019t match an account.');
    }
  };

  return (
    <AuthShell
      title="Sign in"
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="text-ink underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {error && <Notice tone="error">{error}</Notice>}
        <TextField label="Email or username" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" size="lg" disabled={busy} className="mt-2 w-full">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </Button>
      </form>
      <div className="mt-6 border border-dashed border-ink/30 p-4 text-sm">
        <p className="eyebrow mb-2">Demo accounts</p>
        <p className="text-muted">
          <span className="font-mono text-ink">demo</span> has a stocked wardrobe;{' '}
          <span className="font-mono text-ink">alex</span> has only two items. Password for both:{' '}
          <span className="font-mono text-ink">{DEMO_PASSWORD}</span>
        </p>
      </div>
    </AuthShell>
  );
}

export function Welcome() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start px-4 pt-16 sm:items-center sm:pt-28 sm:text-center">
      <p className="eyebrow mb-6 text-muted">Account created ✓</p>
      <h1 className="display text-4xl sm:text-6xl">Let&rsquo;s see what you can make.</h1>
      <p className="mt-6 max-w-lg text-base text-muted">
        Add a few things you already own. Old clothing, fabric scraps, sewing supplies, and tools all work.
      </p>
      <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button to="/materials/new" size="lg">
          Add first material
        </Button>
        <Button to="/explore" size="lg" variant="secondary">
          Explore first
        </Button>
      </div>
    </div>
  );
}
