import Link from 'next/link';
import { ClockIcon, TrophyIcon, UsersIcon } from '@phosphor-icons/react/ssr';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/shared/Footer/Footer';
import Navbar from '@/shared/Navbar/Navbar';
import Section from '@/shared/Section/Section';
import { getContestList, type ContestSummary } from './data/mock-contests';

function ContestCard({ contest }: { contest: ContestSummary }) {
  const cta =
    contest.status === 'ENDED' ? (
      <Link
        href={`/contests/${contest.id}`}
        className="text-sm text-white underline underline-offset-4 hover:text-neutral-300"
      >
        View results
      </Link>
    ) : (
      <Link
        href={`/contests/${contest.id}`}
        className="text-sm text-white underline underline-offset-4 hover:text-neutral-300"
      >
        View contest
      </Link>
    );

  return (
    <Card className="border border-white/15 bg-neutral-950 text-white ring-0">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <CardTitle className="text-sm font-semibold leading-snug text-white">
          {contest.title}
        </CardTitle>
        <Badge variant="outline" className="shrink-0 border-white/25 text-neutral-300">
          {contest.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <p className="text-xs leading-relaxed text-neutral-400">{contest.shortDescription}</p>
        <ul className="space-y-2 text-xs text-neutral-400">
          <li className="flex items-center gap-2">
            <TrophyIcon className="size-4 shrink-0 text-neutral-500" aria-hidden />
            <span>{contest.projectCount} projects</span>
          </li>
          <li className="flex items-center gap-2">
            <UsersIcon className="size-4 shrink-0 text-neutral-500" aria-hidden />
            <span>{contest.participantCount.toLocaleString()} participants</span>
          </li>
          <li className="flex items-center gap-2">
            <ClockIcon className="size-4 shrink-0 text-neutral-500" aria-hidden />
            <span>{contest.timeLabel}</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="border-t border-white/10 px-4 pt-4">{cta}</CardFooter>
    </Card>
  );
}

function ContestSection({
  title,
  subtitle,
  contests,
}: {
  title: string;
  subtitle?: string;
  contests: ContestSummary[];
}) {
  if (contests.length === 0) return null;
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm text-neutral-400">{subtitle}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {contests.map((c) => (
          <ContestCard key={c.id} contest={c} />
        ))}
      </div>
    </section>
  );
}

const Contests = () => {
  const list = getContestList();
  const live = list.filter((c) => c.section === 'live');
  const past = list.filter((c) => c.section === 'past');

  return (
    <div className="min-h-screen bg-black text-white">
      <Section className="flex min-h-screen flex-col py-6">
        <Navbar />
        <main className="mt-8 flex flex-1 flex-col gap-12 pb-12">
          <ContestSection
            title="Live Contests"
            subtitle="Realtime rankings, multi-project scoring, and timed competition rounds."
            contests={live}
          />
          <ContestSection title="Past Contests" contests={past} />
        </main>
        <Footer />
      </Section>
    </div>
  );
};

export default Contests;
