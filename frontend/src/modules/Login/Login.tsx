'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signIn, useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import GoogleIcon from '@/components/icons/google';

export default function Login() {
  return (
    <div className="grid min-h-[calc(100dvh-10rem)] w-full grid-cols-1 lg:min-h-[calc(100dvh-9rem)] lg:grid-cols-2">
      <LoginBrandPanel />
      <LoginAuthPanel />
    </div>
  );
}

function LoginBrandPanel() {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-center overflow-hidden border-border bg-linear-to-t from-border/30 to-transparent px-8 py-14 sm:px-10 lg:border-r lg:px-12 lg:py-16 xl:px-16',
      )}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-2 opacity-90 sm:w-2.5"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--primary) 40%, transparent) 1px, transparent 0)',
          backgroundSize: '4px 4px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-px bg-linear-to-t from-transparent via-border to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-xl flex-col items-center gap-8 text-center lg:mx-0 lg:items-start lg:text-left">
        <div className="space-y-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            XContext
          </p>
          <h1 className="text-balance text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.25rem] lg:leading-snug uppercase font-sans">
            From &ldquo;It works&rdquo; to &ldquo;I can explain it.&rdquo;
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sign in and practice with AI-generated questions—multiple choice, written explanations,
            and small coding prompts built around your code.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginAuthPanel() {
  return (
    <div className="flex flex-col bg-background px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
      <Link
        href="/"
        className="mb-8 inline-flex w-fit items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Home
      </Link>

      <div className="flex flex-1 flex-col justify-center">
        <div className="mx-auto w-full max-w-md space-y-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { data: session } = useSession();
  console.log(session);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="space-y-2 select-none">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground font-sans">
          Sign in to XContext
        </h2>
        <p className="text-sm text-muted-foreground">Connect with:</p>
      </header>

      <div className="text-card-foreground">
        <div className="space-y-6">
          {session ? (
            <div className="space-y-4">
              <p className="border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
                You&apos;re signed in. Continue to the app to start practicing.
              </p>
              <Button asChild className="h-11 w-full gap-2">
                <Link href="/">
                  Start exploring
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Button
                disabled={isLoading}
                type="button"
                variant="outline"
                className="h-11 w-full justify-center gap-2 border-border bg-background text-foreground hover:bg-muted/60"
                onClick={() => {
                  setIsLoading(true);
                  signIn.social({
                    provider: 'google',
                  });
                }}
              >
                {isLoading ? (
                  <Loader className="size-5 animate-spin" aria-hidden />
                ) : (
                  <>
                    <GoogleIcon className="size-5" />
                    <span>Continue with Google</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        New here?{' '}
        <span className="text-foreground">Signing in with Google creates your account.</span>
      </p>
    </div>
  );
}
