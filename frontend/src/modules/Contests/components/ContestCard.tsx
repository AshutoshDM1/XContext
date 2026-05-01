import { type Contest } from '@/store/contests';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrophyIcon, UsersIcon, ClockIcon } from '@phosphor-icons/react/ssr';
import { AdminContestActions } from './AdminContestActions';
import { useJoinContest } from '@/hooks/useContests';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ContestCard({
  contest,
  canManage,
  isAdmin,
}: {
  contest: Contest;
  canManage?: boolean;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const { mutateAsync: joinContest, isPending } = useJoinContest();

  const cta =
    contest.status === 'ENDED' ? (
      <Link
        href={`/contests/${contest.id}`}
        className="text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground"
      >
        See Results
      </Link>
    ) : (
      <Button
        type="button"
        variant="default"
        disabled={isPending}
        onClick={async () => {
          try {
            await joinContest(contest.id);
            router.push(`/contests/${contest.id}`);
          } catch (error) {
            console.error('Error joining contest:', error);
          }
        }}
      >
        {isPending ? 'Joining...' : 'Join Contest'}
      </Button>
    );

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <CardTitle className="text-sm font-semibold leading-snug">{contest.title}</CardTitle>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline">{contest.status}</Badge>
          {contest.isPublic ? (
            <Badge variant="secondary">Public</Badge>
          ) : contest.isPrivate ? (
            <Badge variant="secondary">Private</Badge>
          ) : (
            <Badge variant="secondary">Link</Badge>
          )}
          {canManage && <AdminContestActions contest={contest} isAdmin={isAdmin} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{contest.shortDescription}</p>
        {contest.contestCategories && contest.contestCategories.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {contest.contestCategories.slice(0, 3).map((cc) => (
              <Badge key={cc.categoryId} variant="outline" className="text-[10px]">
                {cc.category.name}
              </Badge>
            ))}
          </div>
        ) : null}
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
            <span>{contest.startsAt || contest.endsAt ? 'Scheduled' : 'Always open'}</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="border-t px-4 pt-4">{cta}</CardFooter>
    </Card>
  );
}
