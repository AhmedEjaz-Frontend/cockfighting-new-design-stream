import React, { useState, useEffect } from "react";
import "./Login.css";
import bannerImage from "../../assets/img/banner4.png";
import logoImage from "../../assets/img/20250701_wala_logo_02 1.png";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { toaster } from "./ui/toaster";


function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "username" ? value.toUpperCase() : value,
    }));
  };

  // Check if user is already logged in
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        if (parsedUserInfo.username) {
          navigate("/dashboard");
        }
      } catch (error) {
        localStorage.removeItem("userInfo");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      // Generate unique ID and sign for API authentication
      const unique =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const signString =
        formData.username +
        formData.password +
        unique +
        "17frk50cogstyxkj358j268k0aysgrx0";

      // Create MD5 hash using crypto-js
      const sign = CryptoJS.MD5(signString).toString();

      const requestBody = {
        operatorId: "TSTAG",
        username: formData.username,
        password: formData.password,
        language: "en-us",
        uniqueid: unique,
        sign: sign,
      };

      const response = await fetch("https://apih5.stagecode.online/logingame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Check if response status is 200
      if (response.status === 200) {
        // Login successful - show success notification and redirect to dashboard
        toaster.create({
          title: "Login Successful",
          description: `Welcome ${formData.username}! Redirecting to dashboard...`,
          status: "success",
          duration: 3000,
        });
        localStorage.setItem("username", formData.username);
        navigate("/dashboard");
      } else {
        // Login failed - show error notification
        toaster.create({
          title: "Login Failed",
          description: "Please check your credentials and try again.",
          status: "error",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-split">
        {/* Left Section - Image/Branding */}
        <div className="login-left-section">
          <img
            src={bannerImage}
            alt="Cock Fighting Banner"
            className="login-banner-image"
          />
          <div className="image-overlay">
            <div className="overlay-content">
              <h2
                style={{
                  color: "white",
                  fontSize: "2rem",
                  marginBottom: "1rem",
                  fontWeight: "bold",
                }}
              >
                Cock Fighting LiveStream
              </h2>
              <p style={{ color: "white", fontSize: "1.1rem", opacity: 0.9 }}>
                Experience the thrill of live cock fighting matches
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="login-form-section">
          <div className="login-card">
            {/* Logo */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <img
                src={logoImage}
                alt="Wala Logo"
                style={{
                  height: "60px",
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: "#fed7d7",
                  color: "#c53030",
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  marginBottom: "1rem",
                  border: "1px solid #feb2b2",
                }}
              >
                {error}
              </div>
            )}
            {/* <Card className="relative w-[350px] overflow-hidden"> */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  className="login-label"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                    textAlign: "left",
                    fontFamily:
                      "'Venite Adoremus', 'Poppins', Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
                  }}
                >
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  disabled={isLoading}
                  className="login-input"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    outline: "none",
                    fontFamily:
                      "'Venite Adoremus', 'Poppins', Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
                    textTransform: "uppercase",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  className="login-label"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                    textAlign: "left",
                    fontFamily:
                      "'Venite Adoremus', 'Poppins', Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
                  }}
                >
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="login-input"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    outline: "none",
                    fontFamily:
                      "'Venite Adoremus', 'Poppins', Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontFamily:
                      "'Venite Adoremus', 'Poppins', Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="login-checkbox"
                    style={{ marginRight: "0.5rem" }}
                  />
                  Remember me
                </label>
                <a
                  href="#"
                  className="login-link"
                  style={{
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontFamily:
                      "'Venite Adoremus', 'Poppins', Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
                  }}
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="login-button"
                data-loading={isLoading}
                style={{
                  width: "100%",
                  padding: "0.875rem",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  marginBottom: "1rem",
                  fontFamily:
                    "'Venite Adoremus', 'Poppins', Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
                }}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            {/* </Card> */}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
