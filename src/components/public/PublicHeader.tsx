"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiShield,
  FiFileText,
  FiUserX,
  FiLogIn,
  FiX,
} from "react-icons/fi";
import dantaLogo from "@/images/danta-suraksha-logo.png";

export default function PublicHeader() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: <FiHome size={19} /> },
    { href: "/privacy-policy", label: "Privacy Policy", icon: <FiShield size={19} /> },
    { href: "/terms-conditions", label: "Terms & Conditions", icon: <FiFileText size={19} /> },
    { href: "/delete-account", label: "Account Delete Request", icon: <FiUserX size={19} /> },
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

  // Track scroll position past 150px (sticky & 35% transparent)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer on Escape key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };

    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  return (
    <header className={`public-header ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="public-header-inner">
        {/* Only Logo on the Header (70px height & width) */}
        <Link
          href="/"
          className="header-logo-container"
          aria-label="Danta Surakshak Home"
          onClick={() => setDrawerOpen(false)}
        >
          <Image
            src={dantaLogo.src}
            alt="Danta Surakshak Logo"
            width={70}
            height={70}
            className="header-brand-logo"
            priority
          />
        </Link>

        {/* Modern Toggle Button: 3 lines (- - _) */}
        <button
          type="button"
          className="header-drawer-toggle-btn"
          aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          <span className="bar bar-top" />
          <span className="bar bar-mid" />
          <span className="bar bar-bot" />
        </button>
      </div>

      {/* Backdrop Overlay */}
      <div
        className={`drawer-backdrop ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Modern Right-to-Left Half Drawer */}
      <aside
        className={`header-half-drawer ${drawerOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site Navigation"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <div className="drawer-logo-wrap">
              <Image
                src={dantaLogo.src}
                alt="Danta Surakshak Logo"
                width={50}
                height={50}
                className="drawer-logo"
              />
            </div>
            <div className="drawer-brand-text">
              <span className="drawer-title">Danta Surakshak</span>
              <span className="drawer-subtitle">
                Faculty of Dental Sciences, RUAS
              </span>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div className="drawer-body">
          <span className="drawer-section-label">MAIN NAVIGATION</span>
          <nav className="drawer-nav">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`drawer-nav-item ${active ? "active" : ""}`}
                  onClick={() => setDrawerOpen(false)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="drawer-divider" />

          {/* Login Action */}
          <div className="drawer-auth-section">
            <Link
              href="/auth/login"
              className="drawer-login-btn"
              onClick={() => setDrawerOpen(false)}
            >
              <FiLogIn size={18} />
              <span>Go To Login</span>
            </Link>
          </div>
        </div>
      </aside>
    </header>
  );
}
