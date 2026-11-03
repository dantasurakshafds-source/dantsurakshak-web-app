"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import { FiLogIn } from "react-icons/fi";
import dantaLogo from "@/images/danta-suraksha-logo.png";

export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-conditions", label: "Terms & Conditions" },
    { href: "/delete-account", label: "Account Delete Request" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href === "/privacy-policy" && pathname?.startsWith("/privacy-policy")) return true;
    if (
      href === "/terms-conditions" &&
      (pathname?.startsWith("/terms-conditions") ||
        pathname?.startsWith("/terms-and-conditions") ||
        pathname?.startsWith("/term-and-conditions"))
    ) {
      return true;
    }
    if (
      href === "/delete-account" &&
      (pathname?.startsWith("/delete-account") || pathname?.startsWith("/delete-user"))
    ) {
      return true;
    }
    return false;
  };

  return (
    <header className="public-header">
      <div className="public-header-inner">
        {/* Brand Link */}
        <Link href="/" className="brand-group" onClick={() => setMobileMenuOpen(false)}>
          <Image
            src={dantaLogo.src}
            alt="Danta Surakshak Logo"
            width={140}
            height={44}
            className="brand-logo-img"
            priority
          />
          <div className="brand-text-col">
            <span className="brand-title">Danta Surakshak</span>
           
          </div> 
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href) ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/auth/login" className="login-btn">
            <FiLogIn size={15} />
            <span>Go To  Login</span>
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-btn"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-link ${isActive(item.href) ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="mobile-login-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            <FiLogIn size={16} />
            <span>Go To  Login</span>
          </Link>
        </div>
      )}
    </header>
  );
}
