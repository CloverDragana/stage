// File debugged predominately with AI to ensure that sessions do expire
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function SessionExpiryHandler() {
  const { data: session } = useSession();
  const router = useRouter();
  const checkIntervalRef = useRef(null);
  
  useEffect(() => {
    // Clean up previous interval if it exists
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    // If no session or token, don't do anything
    if (!session?.accessToken) return;
    
    // Function to check token expiration
    const checkTokenExpiration = () => {
      try {
        const token = session.accessToken;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        
        // If token is expired or will expire in the next 5 seconds
        if (payload.exp && Date.now() >= (payload.exp * 1000) - 5000) {
          console.log("Session expired, logging out");
          
          // Clear the interval
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
          }
          
          // Sign out and redirect to login
          signOut({ redirect: true, callbackUrl: '/login' });
        }
      } catch (error) {
        console.error("Error checking token expiration:", error);
      }
    };
    
    // Check immediately and then every 15 seconds
    checkTokenExpiration();
    checkIntervalRef.current = setInterval(checkTokenExpiration, 15000);
    
    // Cleanup on component unmount
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [session, router]);
  
  // This component doesn't render anything visible
  return null;
}