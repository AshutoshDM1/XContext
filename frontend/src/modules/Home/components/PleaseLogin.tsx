'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PleaseLogin = ({
  open = true,
  onLogin,
  onClose,
}: {
  open?: boolean;
  onLogin?: () => void;
  onClose?: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose?.() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login required</DialogTitle>
          <DialogDescription>
            You need to be logged in to send a message to the AI agent. Please log in to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Not now
          </Button>
          <Button type="button" onClick={onLogin} autoFocus>
            Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PleaseLogin;
