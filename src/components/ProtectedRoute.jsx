import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toaster } from "./ui/toaster";

const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      const userInfo = localStorage.getItem("userInfo");
      console.log(userInfo);

      // If no user info, redirect to login
      if (!userInfo) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        const parsedUserInfo = JSON.parse(userInfo);

        // Check if login was successful (code === '0')
        if (parsedUserInfo.code !== "0") {
          toaster.create({
            title: "Session Invalid",
            description: "Your login session is invalid. Please login again.",
            status: "error",
            duration: 5000,
          });
          localStorage.removeItem("userInfo");
          setIsValid(false);
          setIsValidating(false);
          return;
        }

        // Check if sess_id exists and validate it
        const sessId =
          parsedUserInfo.sess_id || localStorage.getItem("sess_id");

        // if (!sessId) {
        //   localStorage.removeItem("userInfo");
        //   setIsValid(false);
        //   setIsValidating(false);
        //   return;
        // }

        // Validate session with server (similar to getPlayerInfo from public_func.js)
        try {
          const response = await fetch(
            "https://apih5.stagecode.online/getPlayerInfo.php",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sess_id: sessId,
              }),
            }
          );

          // Check if response is ok (status 200-299)
          if (!response.ok) {
            // Handle HTTP errors (401, 404, 500, etc.)
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            let shouldAllowAccess = true; // Default to allowing access for most HTTP errors
            
            if (response.status === 401) {
              errorMessage = "HTTP 401: Unauthorized - Session validation failed. Please login again.";
              shouldAllowAccess = false; // Don't allow access on 401
            } else if (response.status === 403) {
              errorMessage = "HTTP 403: Forbidden - Access denied during session validation.";
              shouldAllowAccess = false;
            } else if (response.status === 404) {
              errorMessage = "HTTP 404: Session validation endpoint not found. Server configuration issue.";
            } else if (response.status === 405) {
              errorMessage = "HTTP 405: Method Not Allowed - Server doesn't accept POST requests for session validation.";
            } else if (response.status >= 500) {
              errorMessage = "HTTP 500+: Server error during session validation. Please try again later.";
            }

            toaster.create({
              title: "Session Validation HTTP Error",
              description: errorMessage,
              status: response.status === 401 || response.status === 403 ? "error" : "warning",
              duration: 7000,
            });
            
            setIsValid(shouldAllowAccess);
            setIsValidating(false);
            return;
          }

          const result = await response.json();

          if (result.code === "B100") {
            // Session is valid, store sess_id if not already stored
            localStorage.setItem("sess_id", sessId);
            setIsValid(true);
          } else {
            // Session expired or invalid
            toaster.create({
              title: "Session Expired",
              description: "Your session has expired. Please login again.",
              status: "warning",
              duration: 5000,
            });
            localStorage.removeItem("userInfo");
            localStorage.removeItem("sess_id");
            setIsValid(false);
          }
        } catch (error) {
          console.error("Session validation error:", error);
          
          let errorMessage = "Unable to verify session. Please check your connection.";
          let toastTitle = "Connection Warning";
          let toastStatus = "warning";
          
          // Detect CORS errors specifically
          if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
            errorMessage = "CORS Error: Unable to connect to session API. The server needs to allow requests from this domain.";
            toastTitle = "CORS Configuration Error";
            toastStatus = "error";
          } else if (error.name === "TypeError" && error.message.includes("NetworkError")) {
            errorMessage = "Network Error: Unable to reach the session server. Please check your internet connection.";
            toastTitle = "Connection Error";
            toastStatus = "warning";
          } else if (error.message.includes("HTTP")) {
            const statusMatch = error.message.match(/(\d{3})/);
            const statusCode = statusMatch ? statusMatch[1] : "unknown";
            
            if (statusCode === "401") {
              errorMessage = "Session Expired: Please log in again to continue.";
              toastTitle = "Authentication Required";
              toastStatus = "warning";
            } else if (statusCode === "405") {
              errorMessage = "Method Not Allowed: Session API configuration issue.";
              toastTitle = "API Configuration Error";
              toastStatus = "error";
            } else {
              errorMessage = `Session API Error (${statusCode}): Unable to validate session.`;
              toastTitle = "Session Error";
              toastStatus = "error";
            }
          }
          
          toaster.create({
            title: toastTitle,
            description: errorMessage,
            status: toastStatus,
            duration: 5000,
          });
          
          // Allow access even if session check fails (network issues)
          setIsValid(true);
        }
      } catch (error) {
        // If userInfo is not valid JSON, redirect to login
        toaster.create({
          title: "Invalid Session Data",
          description: "Session data is corrupted. Please login again.",
          status: "error",
          duration: 5000,
        });
        localStorage.removeItem("userInfo");
        localStorage.removeItem("sess_id");
        setIsValid(false);
      }

      setIsValidating(false);
    };

    validateSession();
  }, []);

  // Show loading while validating
  if (isValidating) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Validating session...
      </div>
    );
  }

  // If session is invalid, redirect to login
  if (!isValid) {
    // return <Navigate to="/login" replace />;
  }

  // If session is valid, render the protected component
  return children;
};

export default ProtectedRoute;
