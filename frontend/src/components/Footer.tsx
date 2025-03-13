'use client';

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const Footer = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasHousehold, setHasHousehold] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);

      // Check if user has household
      if (token) {
        fetch('http://localhost:5001/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then((res) => res.json())
          .then((data) => {
            setHasHousehold(!!data.data?.household_id);
          })
          .catch(console.error);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleContactSupport = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    // Implement support ticket creation or contact form logic
    router.push('/contact');
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push(path);
    }
  };

  return (
    <footer className="w-full bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Contact</h3>
            <div className="space-y-2">
              <a
                href="mailto:info@homebase.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                info@homebase.com
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                +1 (234) 567-890
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Features</h3>
            <div className="space-y-2">
              {hasHousehold ? (
                <>
                  <Link
                    href="/chore"
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Chore Management
                  </Link>
                  <Link
                    href="/expense"
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Expense Tracking
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <span className="block text-sm text-muted-foreground">Join a household to:</span>
                  <span className="block text-sm text-muted-foreground">• Manage Chores</span>
                  <span className="block text-sm text-muted-foreground">• Track Expenses</span>
                </>
              )}
            </div>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Company</h3>
            <div className="space-y-2">
              <Link
                href="/about"
                onClick={(e) => handleLinkClick(e, '/about')}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/privacy"
                onClick={(e) => handleLinkClick(e, '/privacy')}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                onClick={(e) => handleLinkClick(e, '/terms')}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Get Started</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {isLoggedIn
                  ? 'Need help with something?'
                  : 'Ready to simplify your shared living experience?'}
              </p>
              <Button asChild={!isLoggedIn} onClick={isLoggedIn ? handleContactSupport : undefined}>
                {isLoggedIn ? 'Contact Support' : <Link href="/signup">Join HomeBase</Link>}
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} HomeBase. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              onClick={(e) => handleLinkClick(e, '/terms')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              onClick={(e) => handleLinkClick(e, '/privacy')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              onClick={(e) => handleLinkClick(e, '/contact')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
