'use client';
import Section from '@/shared/Section/Section';
import Loader from '@/shared/Loader/Loader';
import { type Contest } from '@/store/contests';
import { CreateContestDialog } from './components/CreateContestDialog';
import { usePublicContests, useUserContests } from '@/hooks/useContests';
import useIsAdmin from '@/lib/admin';
import ContestCard from './components/ContestCard';

export function ContestSection({
  title,
  subtitle,
  contests,
  showCreateButton,
  isAdmin,
}: {
  title: string;
  subtitle?: string;
  contests: Contest[];
  showCreateButton?: boolean;
  isAdmin?: boolean;
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
            <ContestCard key={c.id} contest={c} isAdmin={isAdmin} />
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
  const { data: userContests, isLoading: isUserContestsLoading } = useUserContests();
  const { data: publicContests, isLoading: isPublicContestsLoading } = usePublicContests();
  const isAdmin = useIsAdmin();

  const UserContests =
    userContests?.filter((c: Contest) => !publicContests?.some((p: Contest) => p.id === c.id)) ??
    [];

  if (isUserContestsLoading || isPublicContestsLoading || !userContests || !publicContests) {
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
      <main className="flex flex-1 max-w-7xl mx-auto flex-col gap-12">
        <ContestSection
          title="Your Contests"
          contests={UserContests}
          showCreateButton
          isAdmin={true}
        />
        <ContestSection
          title="Public Contests"
          subtitle="Realtime rankings, multi-project scoring, and timed competition rounds."
          contests={publicContests}
          isAdmin={isAdmin}
        />
      </main>
    </Section>
  );
};

export default Contests;
