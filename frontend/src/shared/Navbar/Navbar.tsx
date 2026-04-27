'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GithubLogoIcon, TrophyIcon } from '@phosphor-icons/react';
import Section from '../Section/Section';

const Navbar = () => {
  const links = [
    {
      label: 'Contests',
      href: '/contests',
      icon: TrophyIcon,
    },
    {
      label: 'Github',
      href: 'https://github.com/AshutoshDM1/XContext',
      icon: GithubLogoIcon,
    },
  ];
  return (
    <Section className="py-2 mb-2">
      <header className="flex items-center justify-between border-b pb-2">
        <Link href="/">
          <div className="text-xs font-medium tracking-[0.22em] uppercase">XContext</div>
        </Link>
        <div className="flex items-center gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="outline" className="h-10 w-full">
                <link.icon className="size-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
      </header>
    </Section>
  );
};

export default Navbar;
