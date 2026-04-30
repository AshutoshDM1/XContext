'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GithubLogoIcon, TrophyIcon, UserIcon } from '@phosphor-icons/react';
import Section from '../Section/Section';
import Profile from './Profile';
import { useSession } from '@/lib/auth-client';

const Navbar = () => {
  const { data: session } = useSession();
  const links = [
    {
      label: 'Github',
      href: 'https://github.com/AshutoshDM1/XContext',
      icon: GithubLogoIcon,
    },
    {
      label: 'Contests',
      href: '/contests',
      icon: TrophyIcon,
    },
    {
      label: 'Login',
      href: '/login',
      icon: UserIcon,
    },
  ];
  return (
    <Section>
      <header className="flex items-center justify-between border-b py-2">
        <Link href="/">
          <div className="text-xs font-medium tracking-[0.22em] uppercase">XContext</div>
        </Link>
        <div className="flex items-center gap-4">
          {links
            .filter((l) => (session ? l.href !== '/login' : true))
            .map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="outline" className="w-full">
                  <link.icon className="size-4" />
                  {link.label}
                </Button>
              </Link>
            ))}

          {session ? <Profile /> : null}
        </div>
      </header>
    </Section>
  );
};

export default Navbar;
