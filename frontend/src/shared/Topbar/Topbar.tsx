'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { XIcon, TrophyIcon, UsersIcon } from '@phosphor-icons/react';

import Section from '@/shared/Section/Section';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useContest, useJoinContest } from '@/hooks/useContests';
import { useSession } from '@/lib/auth-client';

const FEATURED_CONTEST_ID = 7;

const Topbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { data: contest, isLoading } = useContest(FEATURED_CONTEST_ID);
  const { mutateAsync: joinContest, isPending: isJoining } = useJoinContest();

  const [dismissed, setDismissed] = useState(false);

  const languageBadge = useMemo(() => {
    const p = contest?.projects?.[0]?.projectId?.toLowerCase() ?? '';
    if (p.includes('ts') || p.includes('typescript')) return 'TypeScript';
    if (p.includes('js') || p.includes('javascript')) return 'JavaScript';
    return null;
  }, [contest?.projects]);

  if (dismissed) return null;
  if (isLoading || !contest) return null;

  const canJoin = contest.status !== 'ENDED';

  return (
    <>
      {session && isHome && (
        <div className="h-10 border-b bg-muted/30">
          <Section className="mx-auto">
            <div className={cn('flex h-10 items-center justify-between gap-3')}>
              <div className="flex min-w-0 items-center gap-2">
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  Featured
                </Badge>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  Contest
                </Badge>
                {contest.status ? (
                  <Badge
                    variant="outline"
                    className="shrink-0 text-[10px] bg-primary text-primary-foreground"
                  >
                    {contest.status}
                  </Badge>
                ) : null}
                {languageBadge ? (
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {languageBadge}
                  </Badge>
                ) : null}

                <span className="mx-1 hidden h-4 w-px shrink-0 bg-border md:inline-block" />

                <p className="min-w-0 truncate text-xs font-medium text-foreground md:text-sm">
                  {contest.title}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
                  <UsersIcon className="size-4 opacity-70" />
                  <span>{contest.participantCount.toLocaleString()}</span>
                </div>

                <Button
                  type="button"
                  size="sm"
                  className="h-7 px-2.5"
                  variant={canJoin ? 'default' : 'outline'}
                  disabled={isJoining}
                  onClick={async () => {
                    try {
                      if (canJoin) await joinContest(contest.id);
                      router.push(`/contests/${contest.id}`);
                    } catch {
                      // errors are already toasted by hook
                    }
                  }}
                >
                  <TrophyIcon className="size-4" />
                  <span className="hidden sm:inline">
                    {canJoin ? (isJoining ? 'Joining…' : 'Join Now') : 'View'}
                  </span>
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={() => setDismissed(true)}
                  aria-label="Dismiss featured contest banner"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            </div>
          </Section>
        </div>
      )}
    </>
  );
};

export default Topbar;
