import InterviewResult from '@/modules/InterviewResult/InterviewResult';

type Props = {
  params: Promise<{ interviewId: string }>;
};

export default async function InterviewResultPage({ params }: Props) {
  const { interviewId } = await params;
  return <InterviewResult interviewId={interviewId} />;
}
