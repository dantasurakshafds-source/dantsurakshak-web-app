import React from "react";
import Link from "next/link";
import Image from "next/image";
import msruasLogo from "@/images/r-u-o-a-s.png";

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        {/* Navigation Links */}
        <div className="footer-links">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-conditions">Terms & Conditions</Link>
          <Link href="/delete-account">Delete Account</Link>
          <Link href="/auth/login">Portal Login</Link>
        </div>

        {/* University Brand Logo */}
        <Image
          src={msruasLogo.src}
          alt="MSRUAS Logo"
          width={160}
          height={45}
          className="footer-logo"
        />

        {/* Legal Credit Note */}
        <p className="footer-credit">
          © {currentYear} <strong>Danta Surakshak (Oral Health Initiative)</strong>. All
          rights reserved.
          <br />
          Faculty of Dental Sciences, M.S. Ramaiah University of Applied
          Sciences (MSRUAS), Bengaluru.
        </p>
      </div>
    </footer>
  );
}
