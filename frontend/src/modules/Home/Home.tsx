import { Button } from '@/components/ui/button';
import Footer from '@/shared/Footer/Footer';
import Navbar from '@/shared/Navbar/Navbar';
import Section from '@/shared/Section/Section';
import Link from 'next/link';

const Home = () => {
  return (
    <Section>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center">
        <Link href="/contests">
          <Button size="lg">Contest</Button>
        </Link>
      </main>
      <Footer />
    </Section>
  );
};

export default Home;
