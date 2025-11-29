"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20" suppressHydrationWarning>
        <div className="h-16 border-b bg-background" suppressHydrationWarning>
          <div className="w-full px-4 md:px-5 flex h-16 items-center" suppressHydrationWarning>
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-5 w-28 ml-3" />
            <div className="flex-1" suppressHydrationWarning />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
        <div className="flex h-[calc(100vh-4rem)]" suppressHydrationWarning>
          <div className="hidden md:block w-72 border-r p-4 bg-muted/20" suppressHydrationWarning>
            <div className="space-y-3 pt-6" suppressHydrationWarning>
              <Skeleton className="h-4 w-16 mb-4" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>
          <main className="flex-1 p-8 bg-background" suppressHydrationWarning>
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" suppressHydrationWarning>
              <Skeleton className="h-36 w-full rounded-2xl" />
              <Skeleton className="h-36 w-full rounded-2xl" />
              <Skeleton className="h-36 w-full rounded-2xl" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/20" suppressHydrationWarning>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex h-[calc(100vh-4rem)]" suppressHydrationWarning>
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background/50" suppressHydrationWarning>
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
