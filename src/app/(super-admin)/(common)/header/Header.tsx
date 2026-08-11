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
    await signOut({ callbackUrl: "/auth/login" });
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
