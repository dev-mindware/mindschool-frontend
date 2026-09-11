import Link from "next/link";
import { Icon } from "@/components";
import Logo from "@/assets/brand.png";
import Image from "next/image";

export function HeaderSubscription() {
  return (
    <header className="sticky top-0 z-50 border-b bg-card border-border">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <Image src={Logo} alt="Logo" className="size-12" />
          <Link
            href="/plans"
            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Voltar ao Mindgest
          </Link>
        </div>
      </div>
    </header>
  );
}
