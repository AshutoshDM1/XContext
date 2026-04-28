'use client';
import Link from 'next/link';
import { ClockIcon, TrophyIcon, UsersIcon } from '@phosphor-icons/react/ssr';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/shared/Section/Section';
import Loader from '@/shared/Loader/Loader';
import { type Contest } from '@/store/contests';
import { CreateContestDialog } from './components/CreateContestDialog';
import { useContests } from '@/hooks/useContests';

function ContestCard({ contest }: { contest: Contest }) {
  const cta =
    contest.status === 'ENDED' ? (
      <Link
        href={`/contests/${contest.id}`}
        className="text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground"
      >
        See Results
      </Link>
    ) : (
      <Link
        href={`/contests/${contest.id}`}
        className="text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground"
      >
        Give Contest
      </Link>
    );

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <CardTitle className="text-sm font-semibold leading-snug">{contest.title}</CardTitle>
        <Badge variant="outline" className="shrink-0">
          {contest.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{contest.shortDescription}</p>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <TrophyIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>{contest.projects.length} projects</span>
          </li>
          <li className="flex items-center gap-2">
            <UsersIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>{contest.participantCount.toLocaleString()} participants</span>
          </li>
          <li className="flex items-center gap-2">
            <ClockIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>{contest.timeLabel}</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="border-t px-4 pt-4">{cta}</CardFooter>
    </Card>
  );
}

function ContestSection({
  title,
  subtitle,
  contests,
  showCreateButton,
}: {
  title: string;
  subtitle?: string;
  contests: Contest[];
  showCreateButton?: boolean;
}) {
  if (contests.length === 0 && !showCreateButton) return null;
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {subtitle ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {showCreateButton && <CreateContestDialog />}
      </div>
      {contests.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {contests.map((c) => (
            <ContestCard key={c.id} contest={c} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No contests yet. Create your first contest!
          </p>
        </div>
      )}
    </section>
  );
}

const Contests = () => {
  const { data: contests, isLoading } = useContests();

  const yourContests: Contest[] = contests?.filter((c: Contest) => c.status === 'ENDED') ?? [];
  const liveContests: Contest[] = contests?.filter((c: Contest) => c.status === 'LIVE') ?? [];

  if (isLoading) {
    return (
      <Section className="py-6">
        <div className="flex min-h-[400px] flex-1 items-center justify-center">
          <Loader size="sm" message="Loading contests..." />
        </div>
      </Section>
    );
  }

  return (
    <Section className="py-6">
      <main className="flex flex-1 flex-col gap-12">
        <ContestSection title="Your Contests" contests={yourContests} showCreateButton />
        <ContestSection
          title="Live Contests"
          subtitle="Realtime rankings, multi-project scoring, and timed competition rounds."
          contests={liveContests}
        />
      </main>
    </Section>
  );
};

export default Contests;
