import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  
  useEffect(() => {
    const validateSession = async () => {
      const userInfo = localStorage.getItem('userInfo');
      
      // If no user info, redirect to login
      if (!userInfo) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }
      
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        
        // Check if login was successful (code === '0')
        if (parsedUserInfo.code !== '0') {
          localStorage.removeItem('userInfo');
          setIsValid(false);
          setIsValidating(false);
          return;
        }
        
        // Check if sess_id exists and validate it
        const sessId = parsedUserInfo.sess_id || localStorage.getItem('sess_id');
        
        if (!sessId) {
          localStorage.removeItem('userInfo');
          setIsValid(false);
          setIsValidating(false);
          return;
        }
        
        // Validate session with server (similar to getPlayerInfo from public_func.js)
        try {
          const response = await fetch('https://apisingle.stagecode.online/getPlayerInfo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sess_id: sessId
            })
          });
          
          const result = await response.json();
          
          if (result.code === 'B100') {
            // Session is valid, store sess_id if not already stored
            localStorage.setItem('sess_id', sessId);
            setIsValid(true);
          } else {
            // Session expired or invalid
            localStorage.removeItem('userInfo');
            localStorage.removeItem('sess_id');
            setIsValid(false);
          }
        } catch (error) {
          console.error('Session validation error:', error);
          // On network error, allow access but log the error
          setIsValid(true);
        }
        
      } catch (error) {
        // If userInfo is not valid JSON, redirect to login
        localStorage.removeItem('userInfo');
        localStorage.removeItem('sess_id');
        setIsValid(false);
      }
      
      setIsValidating(false);
    };
    
    validateSession();
  }, []);
  
  // Show loading while validating
  if (isValidating) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Validating session...
      </div>
    );
  }
  
  // If session is invalid, redirect to login
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }
  
  // If session is valid, render the protected component
  return children;
};

export default ProtectedRoute;