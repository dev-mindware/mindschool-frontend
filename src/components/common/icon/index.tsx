import { ComponentProps } from "react";
import { icons } from "lucide-react";

export type IconProps = ComponentProps<"button"> & {
  name: keyof typeof icons;
  color?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function Icon({
  name,
  color,
  size,
  strokeWidth,
  className,
}: IconProps) {
  const LucideIcon = icons[name];

  return (
    <LucideIcon
      color={color}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}