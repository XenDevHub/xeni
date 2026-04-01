'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
  
  // DEBUG HELPER: Print what was actually baked into the app
  console.log("XENI_DEBUG: Active Google Client ID is:", clientId);
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
