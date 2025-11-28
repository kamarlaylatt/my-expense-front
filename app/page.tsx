"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Receipt, FolderOpen, ArrowRight } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <span className="font-bold text-xl">My Expense</span>
          </div>
          <nav className="flex items-center gap-4">
            {!isLoading && (
              isAuthenticated ? (
                <Button asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
              )
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          Track Your Expenses
          <br />
          <span className="text-muted-foreground">With Ease</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
          My Expense is a simple and intuitive expense tracking application.
          Organize your spending by categories, view summaries, and take control
          of your finances.
        </p>
        <div className="flex justify-center gap-4">
          {!isLoading && !isAuthenticated && (
            <>
              <Button size="lg" asChild>
                <Link href="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
          {!isLoading && isAuthenticated && (
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Receipt className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Track Expenses</CardTitle>
              <CardDescription>
                Easily log your daily expenses with descriptions, amounts, and dates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add expenses quickly with our intuitive form. View all your
                expenses in a sortable table with filters.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FolderOpen className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Organize by Category</CardTitle>
              <CardDescription>
                Create custom categories to organize your spending.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create color-coded categories like Food, Transport, Entertainment,
                and more to keep your expenses organized.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <LayoutDashboard className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>View Summaries</CardTitle>
              <CardDescription>
                Get insights into your spending patterns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View expense breakdowns by category, see totals, and understand
                where your money goes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} My Expense. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
