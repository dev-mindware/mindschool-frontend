import type { icons } from "lucide-react"

export type Stats = {
  title: string;
  value: string | number;
  icon: keyof typeof icons;
  description: string;
  color?: string;
  bgColor?: string;
};