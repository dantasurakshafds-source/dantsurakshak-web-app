
// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { signOut, useSession } from "next-auth/react";
// import ReusableModal from "@/(common)/Model";
// import { LogOut } from "lucide-react";
// interface headerProps {
//   handleToggleSidebar: () => void;
//   openMenu: () => void;
//   isMobile: boolean;
// }
// const Header: React.FC<headerProps> = ({ isMobile, openMenu,handleToggleSidebar }) => {
//   const { data: session } = useSession();
//   const userName = session?.user?.name || "User";
//   const firstLetter = userName.charAt(0).toUpperCase();
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const handleLogout = () => {
//     signOut({ callbackUrl: "/auth/login" });
//   };

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setDropdownOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);


//   return (
//     <div className="header_inner">
//       <div className="header_wrapper">


//           {!isMobile && <button className="togle-icon" onClick={handleToggleSidebar}>
//           <span className="menu_icon" >
//             ☰
//           </span>
//         </button> }

//         {session && (
//           <div className="user-info" ref={dropdownRef}>
//             <div
//               className="user-icon"
//               onClick={() => setDropdownOpen((prev) => !prev)}
//             >
//               {firstLetter}
//             </div>

//             {dropdownOpen && (
//               <div className="dropdown-menu">
//                 <span
//                   onClick={() => {
//                     setShowLogoutModal(true);
//                     setDropdownOpen(false);
//                   }}
//                   className="logout-button"
//                 >
//                   <LogOut size={18} /> Logout
//                 </span>
//               </div>
//             )}
//           </div>
//         )}
// {isMobile && (
//   <button className="togle-button" onClick={openMenu}>
//     <span className="menu_icon" >
//       ☰
//     </span>
//   </button>
// )}
//       </div>

//       <ReusableModal
//         isOpen={showLogoutModal}
//         message="Are you sure you want to logout?"
//         onConfirm={handleLogout}
//         onCancel={() => setShowLogoutModal(false)}
//       />
//     </div>
//   );
// }

// export default Header;




















"use client";

import React, { useState, useEffect, useRef } from "react";
import ReusableModal from "@/(common)/Model";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { FaBars, FaSearch, FaTooth } from "react-icons/fa";
import Link from "next/link";

interface HeaderProps {
  handleToggleSidebar: () => void;
  openMenu: () => void;
  isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({ isMobile, openMenu, handleToggleSidebar }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  

  const { data: session } = useSession();
  const userName = session?.user?.name || "User";
  const firstLetter = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/login" });
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
          <div className="search-box">
            <FaSearch size={20} color="#56235E" />
            <input type="text" placeholder="Search..." />
          </div>

          {!isMobile && (
            <div className="user-info" ref={dropdownRef}>
              <div className="user-icon" onClick={() => setDropdownOpen((prev) => !prev)}>
                {firstLetter}
              </div>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <span
                    onClick={() => {
                      setShowLogoutModal(true);
                      setDropdownOpen(false);
                    }}
                    className="logout-button"
                  >
                    <LogOut size={18} /> Logout
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
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      </div>
    </div>
  );
};

export default Header;
