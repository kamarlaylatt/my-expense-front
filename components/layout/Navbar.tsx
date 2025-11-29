"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, LogOut, User, Sparkles, Settings, HelpCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout, isAuthenticated } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2 rounded-xl"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">ExpenseFlow</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 hover:bg-primary/10">
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-3 bg-muted/50 rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user?.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href="/dashboard" className="flex items-center py-2">
                    <Sparkles className="mr-3 h-4 w-4 text-muted-foreground" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href="/dashboard" className="flex items-center py-2">
                    <User className="mr-3 h-4 w-4 text-muted-foreground" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer py-2">
                  <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer py-2">
                  <HelpCircle className="mr-3 h-4 w-4 text-muted-foreground" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem 
                  onClick={logout} 
                  className="rounded-lg cursor-pointer py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild className="rounded-full">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="rounded-full px-5">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
