"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Receipt, 
  FolderOpen, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">ExpenseFlow</span>
          </div>
          <nav className="flex items-center gap-4">
            {!isLoading && (
              isAuthenticated ? (
                <Button asChild className="rounded-full px-6">
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="rounded-full">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="rounded-full px-6">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Smart expense tracking made simple
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in">
              Take Control of
              <br />
              <span className="gradient-text">Your Finances</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10 animate-fade-in">
              ExpenseFlow is a beautiful and intuitive expense tracking application.
              Organize spending by categories, visualize trends, and gain insights
              into your financial habits.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in">
              {!isLoading && !isAuthenticated && (
                <>
                  <Button size="lg" asChild className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30">
                    <Link href="/register">
                      Start for Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-base">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </>
              )}
              {!isLoading && isAuthenticated && (
                <Button size="lg" asChild className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/25">
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Free to Use</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">Secure</div>
              <div className="text-sm text-muted-foreground">Your Data is Safe</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">Fast</div>
              <div className="text-sm text-muted-foreground">Lightning Quick</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">Easy</div>
              <div className="text-sm text-muted-foreground">Simple to Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you manage your expenses efficiently
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-fade-in">
            <Card className="group hover-lift shine border-0 shadow-lg bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Receipt className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Track Expenses</CardTitle>
                <CardDescription className="text-base">
                  Log daily expenses with descriptions, amounts, and dates in seconds.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our intuitive form makes adding expenses quick and effortless.
                  View everything in a beautiful sortable table with smart filters.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover-lift shine border-0 shadow-lg bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <FolderOpen className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Organize by Category</CardTitle>
                <CardDescription className="text-base">
                  Create custom color-coded categories to organize your spending.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Food, Transport, Entertainment, and more — create categories
                  that match your lifestyle and spending habits.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover-lift shine border-0 shadow-lg bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Visual Analytics</CardTitle>
                <CardDescription className="text-base">
                  Get insights into your spending patterns at a glance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View expense breakdowns by category with beautiful progress bars
                  and understand where your money goes.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover-lift shine border-0 shadow-lg bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Secure & Private</CardTitle>
                <CardDescription className="text-base">
                  Your financial data is encrypted and protected.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We take security seriously. Your data is safely stored
                  and never shared with third parties.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover-lift shine border-0 shadow-lg bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Lightning Fast</CardTitle>
                <CardDescription className="text-base">
                  Optimized for speed and smooth experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built with modern technology for blazing fast performance.
                  No lag, no waiting — just smooth expense tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover-lift shine border-0 shadow-lg bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="pb-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <LayoutDashboard className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Beautiful Dashboard</CardTitle>
                <CardDescription className="text-base">
                  All your financial data in one elegant view.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A clean, modern dashboard that gives you a complete
                  overview of your expenses and spending trends.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Take Control?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who are already managing their expenses smarter.
              Start tracking today — it&apos;s completely free.
            </p>
            {!isLoading && !isAuthenticated && (
              <Button size="lg" asChild className="rounded-full px-10 h-12 text-base shadow-lg shadow-primary/25">
                <Link href="/register">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold">ExpenseFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ExpenseFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
