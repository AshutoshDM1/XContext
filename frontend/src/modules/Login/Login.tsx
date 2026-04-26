'use client';
import { Button } from '@/components/ui/button';
import { authClient, useSession } from '@/lib/auth-client';
import Section from '@/shared/Section/Section';
import Navbar from '@/shared/Navbar/Navbar';
import Footer from '@/shared/Footer/Footer';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const { data: session } = useSession();
  useEffect(() => {
    if (session !== null) {
      router.push('/');
    }
  }, [session, router]);

  return (
    <Section>
      <Navbar />
      <div className="space-y-10 h-[80vh] flex flex-col items-center justify-center">
        <LoginHeroSection />
        <LoginForm />
      </div>
      <Footer />
    </Section>
  );
}

const LoginHeroSection = () => {
  return (
    <div className="max-w-2xl text-center space-y-4">
      <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl uppercase ">
        From “It works” to <br /> “I can explain it.”
      </h1>
      <p className="text-sm leading-6 text-muted-foreground">
        Sign in, upload code, and practice with AI-generated MCQs, long-form questions, and small
        coding prompts.
      </p>
    </div>
  );
};

const LoginForm = () => {
  return (
    <div className="border border-border bg-card text-card-foreground p-6 md:p-8">
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium">Sign in</div>
          <div className="mt-1 text-xs leading-5 text-muted-foreground">
            Continue with Google to create your account.
          </div>
        </div>

        <Button
          variant="outline"
          className="h-10 w-full"
          onClick={() =>
            authClient.signIn.social({
              provider: 'google',
              callbackURL: 'http://localhost:3000',
            })
          }
        >
          Continue with Google
        </Button>
        <div className="text-[11px] leading-5 text-muted-foreground">
          By continuing, you agree to the app using cookies to keep you signed in.
        </div>
      </div>
    </div>
  );
};
