"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { LayoutDashboard, MessageSquare, Settings, LogOut, Heart, Menu, X, Shield } from "lucide-react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/ui/components/ui/button";
import { Separator } from "@/ui/components/ui/separator";

const navItems = [
  {
    title: "Dashboard",
    href: ROUTES.admin.dashboard,
    icon: LayoutDashboard,
  },
  {
    title: "Apologies",
    href: ROUTES.admin.apologies,
    icon: MessageSquare,
  },
  {
    title: "Security",
    href: "/pradmin/security",
    icon: Shield,
  },
  {
    title: "Settings",
    href: ROUTES.admin.settings,
    icon: Settings,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 lg:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-card transition-transform duration-300 lg:z-30 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
      <div className="flex h-full flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-6 pb-4"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-black dark:text-white tracking-tight">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">I'm Sorry Platform</p>
            </div>
          </div>
        </motion.div>

        <Separator />
        
        <motion.nav
          variants={container}
          initial="hidden"
          animate="show"
          className="flex-1 space-y-1 p-4"
        >
          {navItems.map((navItem, index) => {
            const Icon = navItem.icon;
            const isActive = pathname === navItem.href;
            
            return (
              <motion.div key={navItem.href} variants={item}>
                <Link
                  href={navItem.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span className="font-medium">{navItem.title}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-primary -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>
        
        <Separator />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="p-4"
        >
          <Button
            onClick={() => signOut({ callbackUrl: ROUTES.admin.login })}
            variant="outline"
            className="w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </motion.div>
      </div>
      </aside>
    </>
  );
}
