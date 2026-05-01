import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  interviewId?: number;
};
const EndedDailog = ({ open, onOpenChange, onClose, interviewId }: Props) => {
  const router = useRouter();

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Interview ended</DialogTitle>
          <DialogDescription>
            This interview is completed. You can review your answers or continue to leaderboard to
            see your performance.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {interviewId ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/interview/${interviewId}/result`)}
            >
              View result
            </Button>
          ) : null}
          <Button type="button" variant="outline" onClick={() => router.push('/interviews')}>
            Interview history
          </Button>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EndedDailog;
