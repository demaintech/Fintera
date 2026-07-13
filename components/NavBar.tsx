import React from "react";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
        Home
      </Link>
      <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
        About
      </Link>
      <Link href="/features" className="transition-colors hover:text-foreground/80 text-foreground/60">
        Features
      </Link>
    </nav>
  );
};

export default NavBar;