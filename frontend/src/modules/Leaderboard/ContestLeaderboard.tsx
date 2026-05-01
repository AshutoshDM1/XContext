'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { useContestLeaderboard } from '@/hooks/useContests';
import Section from '@/shared/Section/Section';
import Loader from '@/shared/Loader/Loader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function formatMs(ms: number | null) {
  if (!ms || ms <= 0) return '—';
  const sec = Math.floor(ms / 1000);
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function getInitials(value?: string | null) {
  if (!value) return 'U';
  const parts = value.trim().split(/\s+/g).filter(Boolean);
  const first = parts[0]?.[0] ?? 'U';
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return `${first}${second}`.toUpperCase();
}

export default function ContestLeaderboard({ contestId }: { contestId: string }) {
  const contestIdNumber = useMemo(() => Number(contestId), [contestId]);
  const { data, isLoading } = useContestLeaderboard(contestIdNumber, {
    enabled: Number.isFinite(contestIdNumber) && contestIdNumber > 0,
  });

  if (isLoading) {
    return (
      <Section className="py-6">
        <div className="flex min-h-[400px] flex-1 items-center justify-center">
          <Loader message="Loading leaderboard..." />
        </div>
      </Section>
    );
  }

  if (!data) {
    return (
      <Section className="py-6">
        <div className="text-sm text-muted-foreground">Leaderboard not available.</div>
      </Section>
    );
  }

  const entries = data.entries ?? [];

  return (
    <Section className="py-6">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-foreground">Leaderboard</div>
            <div className="mt-1 text-sm text-muted-foreground">{data.contestTitle}</div>
          </div>
          <Button asChild variant="outline">
            <Link href={`/contests/${data.contestId}`}>Back to contest</Link>
          </Button>
        </div>

        <div className="rounded-none border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="w-28">Score</TableHead>
                <TableHead className="w-32">Time taken</TableHead>
                <TableHead className="w-32">Time left</TableHead>
                <TableHead className="w-28">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No ratings yet.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((e, idx) => {
                  const name = e.name || e.email || 'User';
                  return (
                    <TableRow key={`${e.userId}-${e.interviewId}`}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            <AvatarImage src={e.image ?? undefined} alt={name} />
                            <AvatarFallback>{getInitials(name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-foreground">
                              {name}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">{e.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {typeof e.score === 'number' ? (
                          <Badge variant="secondary">{e.score}/100</Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatMs(e.timeTakenMs)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatMs(e.timeLeftMs)}
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/interview/${e.interviewId}/result`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </Section>
  );
}
