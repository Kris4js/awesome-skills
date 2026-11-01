import type { ReactNode } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';

export function WorkbenchDialog({ title, open, onOpenChange, children }: {
  title: string; open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode;
}) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Backdrop className="beacon-dialog-backdrop" />
      <Dialog.Popup className="beacon-dialog" aria-describedby={undefined}>
        <div className="beacon-dialog-heading"><Dialog.Title>{title}</Dialog.Title>
          <Dialog.Close className="beacon-icon-button" aria-label="关闭"><X /></Dialog.Close>
        </div>
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>;
}
