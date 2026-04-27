import Section from '@/shared/Section/Section';
import { QuestionTextArea } from './components/QuestionTextArea';

const Home = () => {
  return (
    <Section>
      <div className="flex min-h-[75vh] flex-col items-center justify-center gap-10 py-12">
        <QuestionTextArea />
      </div>
    </Section>
  );
};

export default Home;
