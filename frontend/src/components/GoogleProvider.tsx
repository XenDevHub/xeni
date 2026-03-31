'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  // Gracefully construct a baseline client string dynamically preventing the entire Root React DOM crashing when the ENV secretly drops during build contexts
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || 'missing_google_client_id.apps.googleusercontent.com';
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
