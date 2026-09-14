"use client";

import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components";

import { cn } from "@/lib/utils";
import { IconCheckSucessfull } from "./icon-success";
import { IconWarning } from "./icon-warning";
import { useModal } from "@/stores/modal/use-modal-store";

interface ModalProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
  title?: string | ReactNode;
  description?: string | ReactNode;
  canClose?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  sucess?: boolean;
  warning?: boolean;
}

export function GlobalModal({
  id,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  title,
  sucess,
  warning,
  description,
  canClose,
  children,
  footer,
  className,
}: ModalProps) {
  const { open, closeModal } = useModal();

  const isModalOpen =
    controlledIsOpen !== undefined
      ? controlledIsOpen
      : id
      ? open[id] || false
      : false;

  const handleClose = () => {
    if (controlledOnClose) controlledOnClose();
    if (id) closeModal(id);
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen && canClose) {
          handleClose();
        }
      }}
    >
      <DialogContent
        className={className}
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        {canClose && <DialogClose onClick={handleClose} />}

        <DialogHeader className={cn("flex space-x-4 relative")}>
          <div
            className={cn("flex space-x-4  items-center", {
              "flex-col": sucess,
            })}
          >
            {sucess && <IconCheckSucessfull />}
            {warning && <IconWarning />}

            <div
              className={cn("w-full space-y-2", {
                "flex flex-col items-center": sucess,
              })}
            >
              {title && <DialogTitle className="p-0">{title}</DialogTitle>}
              {description && (
                <DialogDescription
                  className={cn({
                    "text-center": sucess,
                  })}
                >
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {children && <div>{children}</div>}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export * from "./subscription-modal";
export * from "./manager-auth-modal";
export { GlobalModal as Modal };
