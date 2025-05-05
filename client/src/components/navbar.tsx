import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { UserRole } from "@/App";
import { useMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavbarProps {
  onRoleToggle: () => void;
  userRole: UserRole;
}

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ href, active, children, onClick }: NavLinkProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "px-1 pt-1 border-b-2 text-sm font-medium",
          active
            ? "border-primary-500 text-gray-900"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
        )}
        onClick={onClick}
      >
        {children}
      </a>
    </Link>
  );
}

export default function Navbar({ onRoleToggle, userRole }: NavbarProps) {
  const isMobile = useMobile();
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ["/api/me"],
  });

  const navLinks = [
    { name: "Dashboard", href: "/" },
    { name: "Startups", href: "/startups" },
    { name: "Investors", href: "/investors" },
    { name: "Pitch Room", href: "/pitch-room" },
    { name: "Leaderboard", href: "/leaderboard" },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">SS</span>
                </div>
                <span className="ml-2 text-xl font-display font-bold text-gray-900">
                  StartupSim
                </span>
              </a>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  href={link.href}
                  active={location === link.href}
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative ml-3">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-full"
                  onClick={onRoleToggle}
                >
                  <i className="fas fa-exchange-alt mr-2"></i>
                  <span>Switch Role</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt="User profile"
                      />
                      <AvatarFallback>
                        {currentUser?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <a className="cursor-pointer w-full">Profile</a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          {isMobile && (
            <div className="flex items-center sm:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <i className="fas fa-bars"></i>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col mt-6 space-y-4">
                    {navLinks.map((link) => (
                      <Link key={link.name} href={link.href}>
                        <a 
                          className={cn(
                            "px-3 py-2 rounded-md text-base font-medium",
                            location === link.href
                              ? "bg-primary-100 text-primary-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )}
                          onClick={closeMenu}
                        >
                          {link.name}
                        </a>
                      </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => {
                          onRoleToggle();
                          closeMenu();
                        }}
                      >
                        <i className="fas fa-exchange-alt mr-2"></i>
                        <span>Switch Role</span>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
