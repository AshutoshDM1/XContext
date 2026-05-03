import Section from '@/shared/Section/Section';
import { HomeContestChat } from './components/HomeContestChat';

const Home = () => {
  return (
    <Section>
      <div className="flex min-h-[75vh] flex-col items-center justify-center gap-10 py-12">
        <HomeContestChat />
      </div>
    </Section>
  );
};

export default Home;
