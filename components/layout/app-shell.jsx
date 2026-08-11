import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils";

/**
 * Shared authenticated-area shell. Feature route groups (applicant, registry)
 * compose this with their own nav items rather than each rebuilding a layout.
 *
 * @param {{ mobileNav?: "drawer" | "bottom" }} props `"drawer"` (default) is
 * the hamburger + Sheet used by registry; `"bottom"` is the applicant
 * portal's fixed tab bar.
 */
export function AppShell({ sidebarItems, navActions, mobileNav = "drawer", children }) {
  const isBottomNav = mobileNav === "bottom";

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar actions={navActions} sidebarItems={sidebarItems} mobileNav={mobileNav} />
      <div className="flex flex-1">
        <Sidebar items={sidebarItems} />
        <main className={cn("min-w-0 flex-1 overflow-x-hidden p-4 lg:p-6", isBottomNav && "pb-20 md:pb-4 lg:pb-6")}>
          {children}
        </main>
      </div>
      {isBottomNav && <BottomNav items={sidebarItems} />}
    </div>
  );
}
