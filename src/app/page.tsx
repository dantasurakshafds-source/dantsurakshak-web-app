"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      router.replace("/super-admin/dashboard");
    } else {
      router.replace("/auth/login");
    }
  }, [session, status, router]);

  return (
    <div style={styles.loadingContainer}>
      <div style={styles.loader}></div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#0a0a2e",
  },
  loader: {
    width: "48px",
    height: "48px",
    border: "3px solid #56235E",
    borderTopColor: "#C1392D",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};