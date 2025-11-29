"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LayoutDashboard, Receipt, FolderOpen, Coins, Sparkles, type LucideIcon } from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & insights",
  },
  {
    title: "Expenses",
    href: "/dashboard/expenses",
    icon: Receipt,
    description: "Manage expenses",
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: FolderOpen,
    description: "Organize spending",
  },
  {
    title: "Currencies",
    href: "/dashboard/currencies",
    icon: Coins,
    description: "Manage currencies",
  },
];

interface SidebarContentProps {
  pathname: string;
  onClose?: () => void;
}

function SidebarContent({ pathname, onClose }: SidebarContentProps) {
  return (
    <nav className="flex flex-col gap-2 p-4">
      <div className="px-3 py-2 mb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Menu
        </p>
      </div>
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "w-full justify-start h-auto py-3 px-3 rounded-xl group transition-all",
              isActive 
                ? "bg-primary/10 text-primary hover:bg-primary/15" 
                : "hover:bg-muted"
            )}
            asChild
            onClick={onClose}
          >
            <Link href={item.href}>
              <div className={cn(
                "flex items-center justify-center h-9 w-9 rounded-lg mr-3 transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted group-hover:bg-muted-foreground/10"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col items-start">
                <span className={cn(
                  "font-medium",
                  isActive && "text-primary"
                )}>
                  {item.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

interface SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 p-0 border-r-0">
          <SheetHeader className="p-5 border-b bg-muted/30">
            <SheetTitle className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-bold">ExpenseFlow</span>
            </SheetTitle>
          </SheetHeader>
          <SidebarContent pathname={pathname} onClose={() => onOpenChange?.(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-full w-72 flex-col border-r bg-muted/20">
        <SidebarContent pathname={pathname} />
      </aside>
    </>
  );
}
