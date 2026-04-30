'use client';

import Link from 'next/link';
import Section from '@/shared/Section/Section';
import Loader from '@/shared/Loader/Loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInterviewsList } from '@/hooks/useInterviewsList';

export default function InterviewsList() {
  const { data, isLoading } = useInterviewsList();

  return (
    <Section className="py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Interview history
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Your past interviews and included problems.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader message="Loading interviews..." />
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid gap-4">
            {data.map((i) => {
              const statusClass =
                i.status === 'COMPLETED'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                  : i.status === 'IN_PROGRESS'
                    ? 'border-sky-500/40 bg-sky-500/10 text-sky-200'
                    : 'border-muted-foreground/30 bg-muted/30 text-muted-foreground';

              return (
                <Link key={i.id} href={`/interview/${i.id}`} className="block">
                  <Card className="cursor-pointer hover:bg-muted/10" size="sm">
                    <CardHeader className="border-b">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="truncate">{i.title}</CardTitle>
                          <CardDescription className="mt-1">{i.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className={statusClass}>
                          {i.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {(i.interviewProjects ?? []).map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center rounded-none border bg-muted/40 px-2 py-1 text-xs text-foreground"
                          >
                            {p.project.projectId}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(i.createdAt).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-none border border-dashed bg-muted/20 p-8 text-center">
            <p className="text-sm font-medium text-foreground">No interviews yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start an interview from a contest after submitting at least one problem.
            </p>
          </div>
        )}
      </div>
    </Section>
  );
}
