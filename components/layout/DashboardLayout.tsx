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
      <div className="min-h-screen" suppressHydrationWarning>
        <div className="h-14 border-b" suppressHydrationWarning>
          <div className="container flex h-14 items-center" suppressHydrationWarning>
            <Skeleton className="h-6 w-32" />
            <div className="flex-1" suppressHydrationWarning />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="flex h-[calc(100vh-3.5rem)]" suppressHydrationWarning>
          <div className="hidden md:block w-64 border-r p-4" suppressHydrationWarning>
            <div className="space-y-2" suppressHydrationWarning>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <main className="flex-1 p-6" suppressHydrationWarning>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" suppressHydrationWarning>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
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
    <div className="min-h-screen" suppressHydrationWarning>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex h-[calc(100vh-3.5rem)]" suppressHydrationWarning>
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-6" suppressHydrationWarning>{children}</main>
      </div>
    </div>
  );
}
