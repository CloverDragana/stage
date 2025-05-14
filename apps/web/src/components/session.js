// This was implemented predominately with the use of AI to help with the debugging of sessions and session expiration
// Only called on homepage to show the length of expiration for the session and the authenication status
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function SessionStatus() {
  const { data: session, status } = useSession();
  const [expiryInfo, setExpiryInfo] = useState("Checking...");
  
  useEffect(() => {
    if (!session?.accessToken) {
      setExpiryInfo("No active session");
      return;
    }
    
    const updateExpiryInfo = () => {
      try {
        const token = session.accessToken;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        
        if (payload.exp) {
          const expiryDate = new Date(payload.exp * 1000);
          const now = new Date();
          const secondsRemaining = Math.floor((expiryDate - now) / 1000);
          
          if (secondsRemaining > 0) {
            setExpiryInfo(`Expires in ${secondsRemaining} seconds`);
          } else {
            setExpiryInfo(`Expired ${-secondsRemaining} seconds ago!`);
          }
        } else {
          setExpiryInfo("Token has no expiration");
        }
      } catch (error) {
        setExpiryInfo(`Error: ${error.message}`);
      }
    };
    
    updateExpiryInfo();
    const interval = setInterval(updateExpiryInfo, 1000);
    
    return () => clearInterval(interval);
  }, [session]);
  
  return (
    <div className="fixed bottom-0 right-0 bg-gray-100 text-sm p-2 rounded-tl shadow-md">
      <div>Status: {status}</div>
      <div>{expiryInfo}</div>
    </div>
  );
}