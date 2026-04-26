'use client';

import { Button } from '@/components/ui/button';
import { GithubLogoIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { authClient, useSession } from '@/lib/auth-client';

export default function Home() {
  const { data: session } = useSession();
  console.log(session);
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="text-xs font-medium tracking-[0.22em] uppercase">XContext</div>
          <Link href="https://github.com/AshutoshDM1/XContext">
            <Button variant="outline" className="h-10 w-full">
              <GithubLogoIcon className="size-4" />
              Github
            </Button>
          </Link>
        </header>

        <section className="flex flex-col items-center justify-center gap-10">
          <div className="max-w-2xl text-center space-y-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              From “It works” to <br /> “I can explain it.”
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Sign in, upload code, and practice with AI-generated MCQs, long-form questions, and
              small coding prompts.
            </p>
          </div>

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
              <Button
                variant="outline"
                className="h-10 w-full"
                onClick={() => authClient.signOut()}
              >
                SignOut
              </Button>

              <div className="text-[11px] leading-5 text-muted-foreground">
                By continuing, you agree to the app using cookies to keep you signed in.
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-[11px] text-muted-foreground">
          <div>© {new Date().getFullYear()} XContext</div>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Status</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
