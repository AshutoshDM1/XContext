import { type Contest } from '@/store/contests';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrophyIcon, UsersIcon, ClockIcon } from '@phosphor-icons/react/ssr';
import { AdminContestActions } from './AdminContestActions';

export default function ContestCard({ contest, isAdmin }: { contest: Contest; isAdmin?: boolean }) {
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
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline">{contest.status}</Badge>
          {isAdmin && <AdminContestActions contest={contest} />}
        </div>
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
