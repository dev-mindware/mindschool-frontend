import { Toaster, ToasterProps } from "sonner"

type ToastProps = ToasterProps;

export function CustomToaster({ ...props }: ToastProps) {
  return (
    <Toaster
      richColors
      position={"top-right"}
      theme="system"
      toastOptions={{
        style: {
          borderRadius: "8px",
          padding: "12px 16px",
        },
        className: "shadow-lg",
      }}
      {...props}
    />
  )
}
