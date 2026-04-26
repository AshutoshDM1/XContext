import { cn } from '@/lib/utils';

interface SectionProps {
  className?: string;
  children: React.ReactNode;
}

const Section = ({ className, children }: SectionProps) => {
  return (
    <section className={cn('max-w-[2000px] mx-auto px-6 py-6', className)}>{children}</section>
  );
};

export default Section;
