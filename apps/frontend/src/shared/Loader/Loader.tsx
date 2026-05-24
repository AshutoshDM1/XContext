import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export default function Loader({ size = 'sm', message, className }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-border border-t-foreground',
          sizeClasses[size],
        )}
        role="status"
        aria-label="Loading"
      />
      {message && <p className={cn('text-muted-foreground', textSizeClasses[size])}>{message}</p>}
    </div>
  );
}

export function LoaderFullScreen({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <Loader size="lg" message={message} />
    </div>
  );
}
