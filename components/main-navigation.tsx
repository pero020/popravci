"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  Info, 
  Settings, 
  Menu, 
  X 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function MainNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const routes: NavItem[] = [
    {
      label: "Home",
      href: "/",
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      label: "Majstori",
      href: "/majstori",
      icon: <Users className="h-4 w-4 mr-2" />,
    },
    {
      label: "My Account",
      href: "/protected",
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
  ];

  function toggleMobileMenu() {
    setMobileMenuOpen(!mobileMenuOpen);
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant={pathname === route.href ? "default" : "ghost"}
            size="sm"
            asChild
          >
            <Link 
              href={route.href}
              className="flex items-center"
            >
              {route.icon}
              {route.label}
            </Link>
          </Button>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMobileMenu}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation */}
      <div className={cn(
        "fixed inset-0 z-50 bg-background md:hidden",
        mobileMenuOpen ? "flex flex-col" : "hidden"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className="font-bold text-lg" onClick={() => setMobileMenuOpen(false)}>
            Popravci
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            aria-label="Close Menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col p-4">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? "default" : "ghost"}
              size="sm"
              className="justify-start mb-1"
              onClick={() => setMobileMenuOpen(false)}
              asChild
            >
              <Link href={route.href} className="flex items-center">
                {route.icon}
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}