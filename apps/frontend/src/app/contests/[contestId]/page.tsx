import Contest from '@/modules/Contest/Contest';

type Props = {
  params: Promise<{ contestId: string }>;
};

export default async function ContestPage({ params }: Props) {
  const { contestId } = await params;
  return <Contest contestId={contestId} />;
}
