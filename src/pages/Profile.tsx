import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, LogOut, Pencil, User as UserIcon } from 'lucide-react';
import { getProject } from '../data/projects';
import { useCurrentUser, useMyItems, useMyUserProjects, useSortedPosts } from '../store/selectors';
import { useStore } from '../store/useStore';
import { PostCard } from '../components/PostCard';
import { Page } from '../components/layout/Layouts';
import { Artwork } from '../components/ui/Artwork';
import { Button } from '../components/ui/Button';
import { PhotoField, TextArea, TextField } from '../components/ui/fields';
import { Chip, EmptyState, Eyebrow, Notice } from '../components/ui/primitives';

function Avatar({ src, className = '' }: { src?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center overflow-hidden border border-ink art-dots ${className}`}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <UserIcon className="h-1/2 w-1/2 text-ink/30" strokeWidth={1} />}
    </div>
  );
}

export function Profile() {
  const user = useCurrentUser();
  const items = useMyItems();
  const userProjects = useMyUserProjects();
  const posts = useSortedPosts().filter((p) => p.userId === user?.id);
  const signOut = useStore((s) => s.signOut);
  const navigate = useNavigate();
  const [tab, setTab] = useState<'completed' | 'shared'>('completed');

  if (!user) return null;
  const completed = userProjects.filter((up) => up.status === 'COMPLETED');

  const stats = [
    { value: items.length, label: 'Materials' },
    { value: completed.length, label: 'Completed projects' },
    { value: posts.length, label: 'Shared' },
  ];

  return (
    <Page>
      <header className="flex flex-col gap-6 border-b border-ink pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-5">
          <Avatar src={user.avatar} className="h-20 w-20 shrink-0 sm:h-28 sm:w-28" />
          <div className="min-w-0">
            <Eyebrow>Profile</Eyebrow>
            <h1 className="display mt-2 truncate text-3xl sm:text-5xl">@{user.username}</h1>
            {user.bio && <p className="mt-2 max-w-md text-sm text-muted">{user.bio}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button to="/profile/edit" variant="secondary">
            <Pencil className="h-3.5 w-3.5" /> Edit profile
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              signOut();
              navigate('/', { replace: true });
            }}
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </header>

      <dl className="grid grid-cols-3 border-b border-line">
        {stats.map((s, i) => (
          <div key={s.label} className={`py-6 ${i > 0 ? 'border-l border-line pl-4 sm:pl-8' : ''}`}>
            <dd className="display text-3xl sm:text-5xl">{s.value}</dd>
            <dt className="eyebrow mt-2 text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex gap-2">
        <Chip active={tab === 'completed'} onClick={() => setTab('completed')}>
          Completed ({completed.length})
        </Chip>
        <Chip active={tab === 'shared'} onClick={() => setTab('shared')}>
          Shared ({posts.length})
        </Chip>
      </div>

      <div className="mt-8">
        {tab === 'completed' ? (
          completed.length === 0 ? (
            <EmptyState title="Your finished projects will appear here." action={<Button to="/projects">Start a project</Button>} />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4">
              {completed.map((up) => {
                const project = getProject(up.projectId);
                if (!project) return null;
                return (
                  <Link key={up.id} to={`/projects/${project.id}`} className="group flex flex-col">
                    <div className="overflow-hidden border border-line transition-colors group-hover:border-ink">
                      <Artwork photo={up.finishedPhoto} image={project.cover} sizes="(min-width: 768px) 25vw, 50vw" art={project.art} icon={project.output} alt={project.title} />
                    </div>
                    <p className="mt-3 font-mono text-sm font-semibold uppercase tracking-wide group-hover:underline group-hover:underline-offset-4">
                      {project.title}
                    </p>
                    <p className="eyebrow mt-1 text-emerald-800">Completed ✓</p>
                  </Link>
                );
              })}
            </div>
          )
        ) : posts.length === 0 ? (
          <EmptyState title="Nothing shared yet." body="Finish a project and share it to Explore to inspire someone else." />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

export function EditProfile() {
  const user = useCurrentUser();
  const updateProfile = useStore((s) => s.updateProfile);
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatar, setAvatar] = useState(user?.avatar);
  const [error, setError] = useState<string>();

  if (!user) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[a-zA-Z0-9._]{3,24}$/.test(username.trim())) {
      setError('Username must be 3–24 characters: letters, numbers, dots, underscores.');
      return;
    }
    const result = updateProfile({ username, bio, avatar });
    if (result) setError(result);
    else navigate('/profile');
  };

  return (
    <Page narrow>
      <Link to="/profile" className="eyebrow inline-flex items-center gap-2 text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Profile
      </Link>
      <h1 className="display mt-6 border-b border-ink pb-6 text-3xl sm:text-5xl">Edit profile</h1>
      <form onSubmit={submit} noValidate className="mt-8 grid gap-8 sm:grid-cols-[180px_minmax(0,1fr)]">
        <PhotoField label="Profile image" optional value={avatar} onChange={setAvatar} aspect="aspect-square" />
        <div className="flex flex-col gap-5">
          {error && <Notice tone="error">{error}</Notice>}
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextArea label="Short bio" optional value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} />
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button to="/profile" variant="secondary">
              Cancel
            </Button>
            <Button type="submit">Save profile</Button>
          </div>
        </div>
      </form>
    </Page>
  );
}
