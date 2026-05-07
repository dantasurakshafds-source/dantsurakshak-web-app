"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import loginIlluStration from "@/images/oral-health-hero-banner.png";
import vectorLogin from "@/images/oral-health-vector-1.png";
import Image from "next/image";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function SuperAdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const result = await signIn("superadmin", {
      redirect: true,
      email,
      password,
    });

    console.log(result)

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/super-admin/dashboard");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <Image src={vectorLogin.src} alt="login-vector" width={100} height={100} className="login-vector" />
        <h1 className="app-title">SecurePanel</h1>
        <p className="welcome-text">Welcome back, Super Admin</p>
        <p className="subtitle">Please login to manage your dashboard.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <p className="login-error">{error}</p>}

          <div className="input-group">
            <label>Email</label>
            <div className={`input-wrapper ${email ? "filled" : ""}`}>
              <FiMail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className={`input-wrapper ${password ? "filled" : ""}`}>
              <FiLock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className="login-footer">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            {/* <a className="forgot-password" href="#">Forgot Password?</a> */}
          </div>

          <button className="login-button" type="submit">Login</button>

          {/* <p className="signup-text">
            Don&apos;t have an account? <a href="#">Sign Up</a>
          </p> */}
        </form>

        {/* <footer className="login-footer-links">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Help</a>
        </footer> */}
      </div>

      <div className="login-right">
        <img src={loginIlluStration.src} alt="Login Illustration" />
      </div>
    </div>
  );
}