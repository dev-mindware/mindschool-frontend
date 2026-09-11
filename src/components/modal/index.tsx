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
  id: string;
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

  return (
    <Dialog
      open={open[id] || false}
      onOpenChange={(isOpen) => {
        if (!isOpen && canClose) {
          closeModal(id);
        }
      }}
    >
      <DialogContent
        className={className}
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        {canClose && <DialogClose onClick={() => closeModal(id)} />}

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
