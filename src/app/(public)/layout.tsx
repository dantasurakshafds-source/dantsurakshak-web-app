import React from "react";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import PageTransition from "@/components/public/PageTransition";
import ScrollAnimationProvider from "@/components/public/ScrollAnimationProvider";

export default function PublicPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-site-wrapper">
      <PublicHeader />
      <div className="public-content-container">
        <ScrollAnimationProvider>
          <PageTransition>
            {children}
          </PageTransition>
        </ScrollAnimationProvider>
      </div>
      <PublicFooter />
    </div>
  );
}
