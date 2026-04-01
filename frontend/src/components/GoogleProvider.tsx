'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '755475680976-oo4momhgut4c8l6ttqlqp1h46n6oi7cc.apps.googleusercontent.com';
  
  // DEBUG HELPER: Print what was actually baked into the app
  console.log("XENI_DEBUG: Active Google Client ID is:", clientId);
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
