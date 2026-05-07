"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";

export default function Page() {
  const { data: session, status } = useSession();

  // Particle animation
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDuration = Math.random() * 10 + 5 + "s";
      particle.style.width = particle.style.height = Math.random() * 4 + 2 + "px";
      document.querySelector(".particles")?.appendChild(particle);
      
      setTimeout(() => particle.remove(), 10000);
    };
    
    const interval = setInterval(createParticle, 300);
    return () => clearInterval(interval);
  }, []);

  if (status === "loading") {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
      </div>
    );
  }

  // If logged in, redirect to dashboard or show different content
  if (session) {
    return (
      <div style={styles.container}>
        <div className="particles" style={styles.particles}></div>
        <div style={styles.centeredLogin}>
          <div style={styles.loginCard}>
            <div style={styles.loginIcon}>🦷</div>
            <h1 style={styles.loginTitle}>Danta Surakshak</h1>
            <p style={styles.loginSubtitle}>आपका दंत स्वास्थ्य, हमारी जिम्मेदारी</p>
            <p style={styles.loggedInText}>
              ✅ आप लॉग इन हैं, {session.user?.name?.split(' ')[0] || 'सदस्य'}
            </p>
            <Link href="/api/auth/signout" style={styles.logoutBtn}>
              🚪 लॉगआउट करें
            </Link>
          </div>
        </div>
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 0.5; }
            90% { opacity: 0.5; }
            100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
          }
          .particle {
            position: absolute;
            background: linear-gradient(135deg, #56235E, #C1392D);
            border-radius: 50%;
            animation: float linear infinite;
            pointer-events: none;
          }
        `}</style>
      </div>
    );
  }

  // Not logged in - Show centered login card
  return (
    <div style={styles.container}>
      <div className="particles" style={styles.particles}></div>
      <div style={styles.centeredLogin}>
        <div style={styles.loginCard}>
          <div style={styles.loginIcon}>🦷</div>
          <h1 style={styles.loginTitle}>Danta Surakshak</h1>
          <p style={styles.loginSubtitle}>आपका दंत स्वास्थ्य, हमारी जिम्मेदारी</p>
          <Link href="/auth/login" style={styles.centeredLoginBtn}>
            🔐 लॉग इन
          </Link>
        </div>
      </div>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        .particle {
          position: absolute;
          background: linear-gradient(135deg, #56235E, #C1392D);
          border-radius: 50%;
          animation: float linear infinite;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a2e 0%, #1a0a2e 100%)',
    position: 'relative',
    overflowX: 'hidden',
  },
  particles: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#0a0a2e',
  },
  loader: {
    width: '48px',
    height: '48px',
    border: '3px solid #56235E',
    borderTopColor: '#C1392D',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  centeredLogin: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1,
  },
  loginCard: {
    textAlign: 'center' as const,
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    padding: '3rem',
    borderRadius: '24px',
    border: '1px solid rgba(193, 57, 45, 0.3)',
    minWidth: '320px',
  },
  loginIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    animation: 'pulse 2s infinite',
  },
  loginTitle: {
    color: 'white',
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  loginSubtitle: {
    color: '#a0a0a0',
    marginBottom: '2rem',
  },
  centeredLoginBtn: {
    background: 'linear-gradient(90deg, #56235E, #C1392D)',
    color: 'white',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
    fontWeight: '600',
  },
  loggedInText: {
    color: '#4caf50',
    marginBottom: '1.5rem',
    fontSize: '1rem',
  },
  logoutBtn: {
    background: 'rgba(193, 57, 45, 0.2)',
    color: '#C1392D',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
    fontWeight: '600',
    border: '1px solid #C1392D',
  },
};