import { Button } from '@/components/ui/button';
import Section from '@/shared/Section/Section';
import Link from 'next/link';
import { QuestionTextArea } from './components/QuestionTextArea';

const Home = () => {
  return (
    <Section>
      <div className="flex min-h-[75vh] flex-col items-center justify-center gap-10 py-12">
        <QuestionTextArea />
        <Link href="/contests">
          <Button variant="outline" size="lg">
            Browse contests
          </Button>
        </Link>
      </div>
    </Section>
  );
};

export default Home;
