"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LayoutDashboard, ShieldCheck, Users, ClipboardList, FileText, Images, Stethoscope, HeartPulse, ShieldAlert, BookOpenCheck, MessageCircleQuestion, ShieldEllipsis, FileCheck } from "lucide-react";
import { FaTimes } from "react-icons/fa";
import sidebarLogo from '@/images/danta-suraksha-logo.png';
import Image from "next/image";

interface SidebarProps {
  isSidebarExpanded: boolean;
  isMobile: boolean;
  openMenu: () => void;
}

const links = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/admins", label: "Admin Management", icon: ShieldCheck },
  { href: "/super-admin/dental-experts", label: "Dental Experts", icon: Stethoscope },
  { href: "/super-admin/user", label: "Users", icon: Users },
  { href: "/super-admin/banners", label: "Health Campaigns", icon: Images },
  { href: "/super-admin/diseases", label: "Oral Diseases", icon: HeartPulse },
  { href: "/super-admin/oral-health-habits", label: "Oral Health Habits", icon: ClipboardList },
  { href: "/super-admin/dental-emergencies", label: "Dental Emergencies", icon: ShieldAlert },
  { href: "/super-admin/questionnaires", label: "Health Assessments", icon: ClipboardList },
  { href: "/super-admin/myths-facts", label: "Dental Myths & Facts", icon: BookOpenCheck },
  { href: "/super-admin/announcements", label: "Announcements", icon: FileText },
  { href: "/super-admin/faqs", label: "FAQs", icon: MessageCircleQuestion },
  { href: "/super-admin/privacy-policy", label: "Privacy Policy", icon: ShieldEllipsis },
  { href: "/super-admin/terms-conditions", label: "Terms & Conditions", icon: FileCheck },
];

const Sidebar: React.FC<SidebarProps> = ({ isSidebarExpanded, isMobile, openMenu }) => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {

    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="side_bar_inner relative">
      {isMobile && (
        <div className="sidebar_header">
          <span
            onClick={openMenu}
            className="sidebar-close-button"
            aria-label="Close Sidebar"
          >
            <FaTimes size={20} />
          </span>

          <div className="sidebar-logo p-4 flex justify-center items-center">
            <Image src={sidebarLogo.src} alt="datasuraksha-logo" width={300} height={300} />
          </div>
        </div>
      )}


      <div className={`sidebar-logo-container ${isSidebarExpanded ? "expanded" : "collapsed"}`}>
        <Link href={`/super-admin/dashboard`} className="sidebar-logo-inner">
          <Image src={sidebarLogo.src} alt="datasuraksha-logo" width={300} height={300} className="danta-logo" />
        </Link>
      </div>
      <div className="sidebar_wrapper mt-6">
        <ul className="sidebar_links">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <li key={href} className={`sidebar-link ${isActive ? "active" : ""
                }`}>
                <Link
                  href={href}
                >
                  <span><Icon size={20} /></span>
                  {(isMobile || isSidebarExpanded) && <h1>{label}</h1>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;