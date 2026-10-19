import { ArrowRight } from 'lucide-react';
import { PROJECTS } from '../data/projects';
import { useSortedPosts } from '../store/selectors';
import { PostCard } from '../components/PostCard';
import { Artwork } from '../components/ui/Artwork';
import { Button } from '../components/ui/Button';

const STEPS = [
  { n: '01', title: 'Add what you have', body: 'Log old clothing, leftover fabric, and the tools you already own.' },
  { n: '02', title: 'Find something to make', body: 'See projects that match your wardrobe, and exactly what each one needs.' },
  { n: '03', title: 'Make it', body: 'Follow clear, step-by-step instructions at your own pace.' },
  { n: '04', title: 'Share your work', body: 'Post the finished piece so someone else can make their own.' },
];

export function Landing() {
  const posts = useSortedPosts().slice(0, 4);
  const hero = [PROJECTS[0], PROJECTS[3], PROJECTS[4]];

  return (
    <div>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-24">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-6 text-muted">Clothing upcycling · Gen 1</p>
          <h1 className="display text-[2.6rem] sm:text-6xl lg:text-7xl">
            What can you make with what you already have?
          </h1>
          <p className="mt-6 max-w-lg text-base text-muted sm:text-lg">
            Turn unwanted clothing and leftover materials into projects you can actually make.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button to="/signup" size="lg">
              Get started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button to="/explore" size="lg" variant="secondary">
              Explore
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 self-end lg:col-span-5">
          {hero.map((p, i) => (
            <figure key={p.id} className={i === 1 ? 'translate-y-8' : ''}>
              <Artwork image={p.cover} sizes="(min-width: 768px) 20vw, 33vw" art={p.art} icon={p.output} alt={p.title} aspect="aspect-[3/5]" className="border border-ink" />
              <figcaption className="eyebrow mt-2 truncate text-muted">{p.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="border-y border-ink" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="sr-only">
          How it works
        </h2>
        <ol className="mx-auto grid max-w-7xl sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              className={`flex flex-col gap-4 border-line px-4 py-8 sm:px-6 lg:px-10 lg:py-12 ${
                i > 0 ? 'border-t sm:border-t-0' : ''
              } ${i % 2 === 1 ? 'sm:border-l' : ''} ${i >= 2 ? 'sm:border-t lg:border-t-0' : ''} ${i > 0 ? 'lg:border-l' : ''}`}
            >
              <span className="display text-4xl sm:text-5xl">{s.n}</span>
              <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">{s.title}</h3>
              <p className="text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-end justify-between border-b border-line pb-3">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider sm:text-base">Made by the community</h2>
          <Button to="/explore" variant="ghost" size="sm">
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
