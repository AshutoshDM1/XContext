import Interview from '@/modules/Interview/Interview';

type Props = {
  params: Promise<{ interviewId: string }>;
};

export default async function InterviewPage({ params }: Props) {
  const { interviewId } = await params;
  return <Interview interviewId={interviewId} />;
}
