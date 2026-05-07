"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LayoutDashboard, ShieldCheck, UserCheck, Users, ImageIcon, Thermometer, ClipboardList, ListChecks, Smile, BookOpen, FileText,HelpCircle,Shield,FileSignature   } from "lucide-react";
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
  { href: "/super-admin/admin", label: "Admins", icon: ShieldCheck },
  { href: "/super-admin/dantasurakshaks", label: "Dantasurakshaks", icon: UserCheck },
  { href: "/super-admin/user", label: "Users", icon: Users },
  { href: "/super-admin/slider", label: "Slider", icon: ImageIcon },
  { href: "/super-admin/disease", label: "Diseases", icon: Thermometer },
  // { href: "/super-admin/lesion", label: "Lesions", icon: Microscope },
  { href: "/super-admin/habit-health", label: "Habit Health", icon: ListChecks },
  { href: "/super-admin/dental-emergency", label: "Dental Emergency", icon: Smile },
  { href: "/super-admin/questionnaire", label: "Questionnaires", icon: ClipboardList },
  { href: "/super-admin/myth-and-facts", label: "Myth&Facts", icon: BookOpen },
  { href: "/super-admin/text-slider", label: "Text Slider", icon: FileText },
  { href: "/super-admin/faqs", label: "Faqs", icon: HelpCircle },
  { href: "/super-admin/privacy-policy", label: "Privacy Policy", icon: Shield  },
  { href: "/super-admin/term-and-conditions", label: "Term&Conditions", icon: FileSignature  },
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
            <h1>Logo</h1>
          </div>
        </div>
      )}



      {/* <div className="sidebar-user-profile-container">
        <div className="sidebar-user-icon">
          <img src="https://randomuser.me/api/portraits/men/41.jpg" alt="img" />
        </div>
        <div className="sidebar-user-name">

          {(isMobile || isSidebarExpanded) &&
            <>
              <h2>{userName}</h2>
              <p>Dept Admin</p>
            </>
          }
        </div>
      </div> */}


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
