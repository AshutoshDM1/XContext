'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GithubLogoIcon } from '@phosphor-icons/react';
import Section from '../Section/Section';

const Navbar = () => {
  return (
    <Section className="py-2 mb-2">
      <header className="flex items-center justify-between border-b pb-2">
        <div className="text-xs font-medium tracking-[0.22em] uppercase">XContext</div>
        <Link href="https://github.com/AshutoshDM1/XContext">
          <Button variant="outline" className="h-10 w-full">
            <GithubLogoIcon className="size-4" />
            Github
          </Button>
        </Link>
      </header>
    </Section>
  );
};

export default Navbar;
