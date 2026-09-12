import { ComponentProps } from "react";
import { icons } from "lucide-react";

const ICON_ALIASES: Record<string, keyof typeof icons> = {
  AlertTriangle: "TriangleAlert",
  AlertCircle: "CircleAlert",
  AlertOctagon: "OctagonAlert",
  CheckSquare: "SquareCheck",
  CheckSquare2: "SquareCheck",
  CheckSquareBig: "SquareCheckBig",
  CheckCircle: "CircleCheck",
  CheckCircle2: "CircleCheck",
  CircleCheck2: "CircleCheck",
  PlusCircle: "CirclePlus",
  MinusCircle: "CircleMinus",
  XCircle: "CircleX",
  HelpCircle: "CircleHelp",
  FileEdit: "FilePenLine",
  Edit: "Pencil",
  Edit2: "PenLine",
  Edit3: "PenLine",
  Sliders: "SlidersHorizontal",
  DownloadCloud: "CloudDownload",
  UploadCloud: "CloudUpload",
  PieChart: "ChartPie",
  BarChart: "ChartBar",
  BarChart2: "ChartBar",
  BarChart3: "ChartColumn",
  LineChart: "ChartLine",
  AreaChart: "ChartArea",
  MoreHorizontal: "Ellipsis",
  MoreVertical: "EllipsisVertical",
  user: "User",
  building: "Building",
  building2: "Building2",
};

export type IconProps = ComponentProps<"button"> & {
  name: keyof typeof icons | (string & {});
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
  if (!name) return null;

  const resolvedName = (ICON_ALIASES[name] || name) as keyof typeof icons;
  const LucideIcon = icons[resolvedName] || icons.CircleHelp;

  if (!LucideIcon) {
    return null;
  }

  return (
    <LucideIcon
      color={color}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}