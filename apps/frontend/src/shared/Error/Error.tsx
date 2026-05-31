'use client';

import * as React from 'react';
import { AlertCircle, Lock, RefreshCw, ShieldAlert, WifiOff, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorProps {
  error?: any;
  title?: string;
  message?: string;
  retry?: () => void;
  variant?: 'page' | 'card' | 'inline';
  className?: string;
}

export default function Error({
  error,
  title,
  message,
  retry,
  variant = 'page',
  className,
}: ErrorProps) {
  // Extract details from axios error or standard error
  const status = error?.response?.status || error?.status;
  const rawMessage =
    error?.response?.data?.message || error?.response?.data?.error || error?.message || '';

  // Classify error type
  let icon = <AlertCircle className="h-10 w-10 text-destructive/80" />;
  let computedTitle = title || 'Something went wrong';
  let computedMessage = message || rawMessage || 'An unexpected error occurred. Please try again.';

  if (status === 429) {
    icon = <ShieldAlert className="h-12 w-12 text-amber-500 animate-pulse" />;
    computedTitle = title || 'Rate Limit Exceeded';
    computedMessage =
      message ||
      'You are sending requests too quickly! Please take a short break and try again in a few minutes.';
  } else if (status === 401 || status === 403) {
    icon = <Lock className="h-12 w-12 text-rose-500" />;
    computedTitle = title || 'Access Denied';
    computedMessage =
      message || 'You do not have permission to view this resource. Please sign in and try again.';
  } else if (error?.code === 'ERR_NETWORK' || rawMessage.toLowerCase().includes('network')) {
    icon = <WifiOff className="h-12 w-12 text-slate-400" />;
    computedTitle = title || 'Network Offline';
    computedMessage =
      message || 'Unable to reach the server. Please check your internet connection and try again.';
  } else if (status === 404) {
    icon = <XCircle className="h-12 w-12 text-sky-500" />;
    computedTitle = title || 'Not Found';
    computedMessage = message || 'The requested resource could not be found or has been moved.';
  }

  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    if (!retry) return;
    setIsRetrying(true);
    try {
      await retry();
    } finally {
      // Small timeout for smooth animation transition
      setTimeout(() => {
        setIsRetrying(false);
      }, 500);
    }
  };

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 border border-destructive/20 bg-destructive/10 p-4 text-sm text-foreground',
          className,
        )}
      >
        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
        <div className="flex-1">
          <span className="font-semibold">{computedTitle}: </span>
          <span>{computedMessage}</span>
        </div>
        {retry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
            className="h-8 gap-1.5 px-3 py-1 font-medium hover:bg-destructive/10 text-destructive-foreground cursor-pointer"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isRetrying && 'animate-spin')} />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden p-6',
        variant === 'page' ? 'min-h-[450px] w-full flex-1' : 'w-full',
        className,
      )}
    >
      <div
        className={cn(
          'relative flex flex-col items-center text-center p-8 md:p-10 border border-border/60 bg-card/45 backdrop-blur-md shadow-sm transition-all duration-300 max-w-sm w-full',
          variant === 'card' && 'p-6 md:p-8 border-border/80',
        )}
      >
        {/* Animated Icon Container */}
        <div className="relative mb-5 flex size-5 items-center justify-center bg-muted/30  group">
          <div className="absolute inset-0 -z-10 bg-linear-to-b from-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {icon}
        </div>

        {/* Error Info */}
        <h3 className="text-md tracking-tight text-foreground md:text-base">{computedTitle}</h3>
        <p className="mt-3 text-xs max-w-60 leading-relaxed text-muted-foreground">
          {computedMessage}
        </p>

        {/* Retry Actions */}
        {retry && (
          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleRetry}
              disabled={isRetrying}
              className="gap-2 font-medium hover:bg-muted/50 cursor-pointer shadow-sm relative overflow-hidden border-border/80 w-full"
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform duration-500',
                  isRetrying && 'animate-spin',
                )}
              />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
