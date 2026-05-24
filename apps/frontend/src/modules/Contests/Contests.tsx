'use client';
import * as React from 'react';
import Section from '@/shared/Section/Section';
import Loader from '@/shared/Loader/Loader';
import { type Contest } from '@/store/contests';
import { CreateContestDialog } from './components/CreateContestDialog';
import { usePublicContests, useUserContests } from '@/hooks/useContests';
import { useCategories } from '@/hooks/useCategories';
import useIsAdmin from '@/lib/admin';
import ContestCard from './components/ContestCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CreateCategoryDialog } from './components/CreateCategoryDialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function ContestSection({
  title,
  subtitle,
  contests,
  showCreateButton,
  canManage,
  isAdmin,
}: {
  title: string;
  subtitle?: string;
  contests: Contest[];
  showCreateButton?: boolean;
  canManage?: boolean;
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
            <ContestCard key={c.id} contest={c} canManage={canManage} isAdmin={isAdmin} />
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
  const { data: categories } = useCategories();
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<number[]>([]);

  const myContests = userContests ?? [];
  const publicListed = publicContests ?? [];

  const filterByCategories = (contests: Contest[]) => {
    if (selectedCategoryIds.length === 0) return contests;
    return contests.filter((c) => {
      const ids = c.contestCategories?.map((cc) => cc.categoryId) ?? [];
      return selectedCategoryIds.some((id) => ids.includes(id));
    });
  };

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
      <main className="flex flex-1 max-w-7xl mx-auto flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs defaultValue="public" className="w-full">
            <TabsList variant="line" className="w-fit bg-muted/30 p-0 gap-0 border border-border">
              <TabsTrigger
                value="public"
                className="px-4 py-1.5 border-r border-border bg-transparent text-foreground/70 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:-bottom-px data-[state=active]:after:h-0.5 data-[state=active]:after:bg-foreground"
              >
                Public Contests
                <span className="ml-2 rounded-none bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {publicListed.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="private"
                className="px-4 py-1.5 bg-transparent text-foreground/70 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:-bottom-px data-[state=active]:after:h-0.5 data-[state=active]:after:bg-foreground"
              >
                Your Contests
                <span className="ml-2 rounded-none bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {myContests.length}
                </span>
              </TabsTrigger>
            </TabsList>

            {categories && categories.length > 0 ? (
              <>
                <Label className="text-xs font-medium text-foreground mt-4">
                  Select Categories :
                </Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const active = selectedCategoryIds.includes(cat.id);
                    const disabled = !active && selectedCategoryIds.length >= 3;
                    return (
                      <Button
                        key={cat.id}
                        type="button"
                        size="sm"
                        variant={active ? 'default' : 'outline'}
                        disabled={disabled}
                        onClick={() => {
                          setSelectedCategoryIds((prev) =>
                            prev.includes(cat.id)
                              ? prev.filter((x) => x !== cat.id)
                              : [...prev, cat.id],
                          );
                        }}
                      >
                        {cat.name}
                      </Button>
                    );
                  })}
                  {isAdmin ? <CreateCategoryDialog /> : null}
                </div>
              </>
            ) : null}
            <Separator className="mt-2" />
            <TabsContent value="private" className="mt-0">
              <ContestSection
                title="Your Contests"
                contests={filterByCategories(myContests)}
                showCreateButton
                canManage
                isAdmin={isAdmin}
              />
            </TabsContent>

            <TabsContent value="public" className="mt-0">
              <ContestSection
                title="Public Contests"
                subtitle="Accessible by everyone and shown in the contest panel."
                contests={filterByCategories(publicListed)}
                canManage={isAdmin}
                isAdmin={isAdmin}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </Section>
  );
};

export default Contests;
