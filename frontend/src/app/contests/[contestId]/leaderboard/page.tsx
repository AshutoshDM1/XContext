import ContestLeaderboard from '@/modules/Leaderboard/ContestLeaderboard';

type Props = {
  params: Promise<{ contestId: string }>;
};

export default async function ContestLeaderboardPage({ params }: Props) {
  const { contestId } = await params;
  return <ContestLeaderboard contestId={contestId} />;
}
