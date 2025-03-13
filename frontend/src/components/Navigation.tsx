'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [hasHousehold, setHasHousehold] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserDetails = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: { id?: string } = jwtDecode(token);
        const userId = decodedToken.id;

        if (userId) {
          const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setUserName(result.data.name);
              setIsLoggedIn(true);
              setHasHousehold(!!result.data.household_id); // Check if user has a household
            }
          } else {
            setIsLoggedIn(false);
          }
        }
      } catch {
        setIsLoggedIn(false);
      }
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName(null);
    setIsDropdownOpen(false);
    setHasHousehold(false);
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:text-primary">
            HomeBase
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {isLoggedIn && (
                <>
                  {hasHousehold && (
                    <>
                      <NavigationMenuItem>
                        <Link href="/dashboard" legacyBehavior passHref>
                          <NavigationMenuLink
                            className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                              pathname === '/dashboard' ? 'text-primary' : ''
                            }`}
                          >
                            Dashboard
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <Link href="/expense" legacyBehavior passHref>
                          <NavigationMenuLink
                            className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                              pathname === '/expense' ? 'text-primary' : ''
                            }`}
                          >
                            Expenses
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <Link href="/chore" legacyBehavior passHref>
                          <NavigationMenuLink
                            className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                              pathname === '/chore' ? 'text-primary' : ''
                            }`}
                          >
                            Chores
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    </>
                  )}
                  <NavigationMenuItem>
                    <Link href="/homes" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                          pathname === '/homes' ? 'text-primary' : ''
                        }`}
                      >
                        Homes
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/usettings" legacyBehavior passHref>
                      <NavigationMenuLink
                        className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                          pathname === '/usettings' ? 'text-primary' : ''
                        }`}
                      >
                        Settings
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    {userName || 'User'}
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {isLoggedIn && (
              <>
                {hasHousehold && (
                  <>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/expense">Expenses</Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/chore">Chores</Link>
                    </Button>
                  </>
                )}
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/homes">Homes</Link>
                </Button>
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/usettings">Settings</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}
            {!isLoggedIn && (
              <Button variant="default" asChild className="w-full">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
