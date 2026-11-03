import React from "react";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

export default function PublicPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-site-wrapper">
      <PublicHeader />
      <div className="public-content-container">
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}
