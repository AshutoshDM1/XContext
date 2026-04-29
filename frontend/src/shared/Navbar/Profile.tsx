'use client';

import { useMemo, useState } from 'react';
import { signOut, useSession } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function getInitials(value?: string | null) {
  if (!value) return 'U';
  const parts = value.trim().split(/\s+/g).filter(Boolean);
  const first = parts[0]?.[0] ?? 'U';
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return `${first}${second}`.toUpperCase();
}

const Profile = () => {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const user = (session as unknown as { user?: unknown } | null | undefined)?.user as
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        id?: string | null;
        isAdmin?: boolean | null;
      }
    | undefined;

  const displayName = useMemo(() => user?.name ?? user?.email ?? 'User', [user?.email, user?.name]);
  const initials = useMemo(() => getInitials(user?.name ?? user?.email), [user?.email, user?.name]);

  if (isPending) {
    return <div className="h-10 w-10 rounded-full border border-border bg-muted/40" aria-hidden />;
  }

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="rounded-full cursor-pointer outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open profile"
        >
          <Avatar size="default">
            <AvatarImage src={user?.image ?? undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>Your signed-in details.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src={user?.image ?? undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">{displayName}</div>
            {user?.email && (
              <div className="truncate text-xs text-muted-foreground">{user.email}</div>
            )}
          </div>
        </div>

        <div className="space-y-2 rounded-md border border-border bg-muted/20 p-3">
          {user?.id && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">User ID</span>
              <span className="max-w-[60%] truncate text-xs text-foreground">{user.id}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Admin</span>
            <span className="text-xs text-foreground">{user?.isAdmin ? 'Yes' : 'No'}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Status</span>
            <span className="text-xs text-foreground">Signed in</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={loggingOut}
            onClick={async () => {
              try {
                setLoggingOut(true);
                await signOut();
                setOpen(false);
              } finally {
                setLoggingOut(false);
              }
            }}
          >
            {loggingOut ? 'Logging out…' : 'Logout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Profile;
