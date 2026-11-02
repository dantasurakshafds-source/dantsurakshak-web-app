"use client";

import React, { useState, useEffect, useRef } from "react";
import ReusableModal from "@/(common)/Model";
import OvalLoader from "@/(common)/OvalLoader";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { FaBars, FaTooth } from "react-icons/fa";
import Link from "next/link";

interface HeaderProps {
  handleToggleSidebar: () => void;
  openMenu: () => void;
  isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({ isMobile, openMenu, handleToggleSidebar }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const userName = session?.user?.name || "User";
  const firstLetter = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // 1. Call dedicated server logout API to expire session cookies on server
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch((e) => console.error("Logout API error:", e));

      // 2. Call NextAuth signOut to reset client session context
      await signOut({ redirect: false }).catch((e) =>
        console.error("NextAuth signOut error:", e)
      );

      // 3. Clear client-accessible cookies
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
      }

      // 4. Clear any local/session storage
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
    } finally {
      // 5. Hard replace location to login page
      window.location.replace("/auth/login");
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="header_inner">
      <div className="header_wrapper">
        <div className="toggle-logo-section">
          {!isMobile && (
            <span className="togle-icon" onClick={handleToggleSidebar}>
              <FaBars size={20} color="#56235E" />
            </span>
          )}
          <Link href={`/super-admin/dashboard`} className="logo-wrapper">
            <span className="logo">
              <FaTooth size={22} color="#56235E" />
            </span>
            <span className="logo-text">
              Oral Health
            </span>
          </Link>
        </div>

        <div className="right-section">

          {!isMobile && (
            <div className="user-info" ref={dropdownRef}>
              <div className="user-icon" onClick={() => setDropdownOpen((prev) => !prev)}>
                {firstLetter}
              </div>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <span
                    onClick={() => {
                      if (!isLoggingOut) {
                        setShowLogoutModal(true);
                        setDropdownOpen(false);
                      }
                    }}
                    className="logout-button"
                  >
                    {isLoggingOut ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <OvalLoader height="16" width="16" color="#56235E" ariaLabel="oval-loading" />
                        <span>Logging out...</span>
                      </span>
                    ) : (
                      <>
                        <LogOut size={18} /> Logout
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}


        </div>
        {isMobile && (

          <span className="menu_icon togle-button" onClick={openMenu}>
            <FaBars size={20} color="#fff" />
          </span>

        )}

        <ReusableModal
          isOpen={showLogoutModal}
          message="Are you sure you want to logout?"
          isLoading={isLoggingOut}
          onConfirm={handleLogout}
          onCancel={() => {
            if (!isLoggingOut) setShowLogoutModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default Header;
