import Link from "next/link";
import { FileText } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Navbar({ actions, sidebarItems, mobileNav = "drawer" }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between gap-2 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {sidebarItems && mobileNav === "drawer" && <MobileNav items={sidebarItems} />}
          <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold">
            <FileText className="size-5 shrink-0 text-primary" />
            <span className="hidden truncate sm:inline">Document Request System</span>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
