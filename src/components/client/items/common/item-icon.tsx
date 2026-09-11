import { Icon } from "@/components/common";

interface ItemIconProps {
  className?: string;
  type: "PRODUCT" | "SERVICE";
}

export const ItemIcon = ({
  className = "w-6 h-6 text-primary",
  type = "PRODUCT",
}: ItemIconProps) => (
  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10">
    <Icon
      name={type === "PRODUCT" ? "Package" : "Store"}
      className={className}
    />
  </div>
);
