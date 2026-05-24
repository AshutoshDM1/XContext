'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateCategory } from '@/hooks/useCategories';

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const { mutate: createCategory, isPending } = useCreateCategory();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          New category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create category</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="categoryName">Name</Label>
          <Input
            id="categoryName"
            placeholder="e.g., Frontend"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Slug is auto-generated (kebab-case).</p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending || !name.trim()}
            onClick={() => {
              createCategory(
                { name: name.trim() },
                {
                  onSuccess: () => {
                    setName('');
                    setOpen(false);
                  },
                },
              );
            }}
          >
            {isPending ? 'Creating…' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
