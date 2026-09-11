import { RouteProtector } from "@/contexts";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteProtector allowed={["OWNER"]}> {children}</RouteProtector>;
}
