import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedinIn, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { Fish } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Column 1: Logo and About */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Fish className="h-7 w-7 text-primary" />
              <span className="font-bold text-2xl">Fintera</span>
            </Link>
            <p className="text-foreground/70 text-sm max-w-xs">
              Empowering aquaculture with smart, data-driven solutions for a sustainable future.
            </p>
          </div>

          {/* Column 2: Product Links */}
          <div>
            <h4 className="font-semibold mb-4 tracking-wide">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/features" className="text-sm text-foreground/70 hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-sm text-foreground/70 hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/docs" className="text-sm text-foreground/70 hover:text-foreground transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Column 3: Company Links */}
          <div>
            <h4 className="font-semibold mb-4 tracking-wide">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-foreground/70 hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="text-sm text-foreground/70 hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-sm text-foreground/70 hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal Links */}
          <div>
            <h4 className="font-semibold mb-4 tracking-wide">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-foreground/70 hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-foreground/70 hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-foreground/60">
            &copy; {new Date().getFullYear()} Fintera, Inc. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="#" aria-label="X (formerly Twitter)" className="text-foreground/60 hover:text-foreground transition-colors">
              <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="GitHub" className="text-foreground/60 hover:text-foreground transition-colors">
              <FontAwesomeIcon icon={faGithub} className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="LinkedIn" className="text-foreground/60 hover:text-foreground transition-colors">
              <FontAwesomeIcon icon={faLinkedinIn} className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;