'use client';

import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

interface GoogleLoginResponse {
  credential?: string;
  clientId?: string;
  select_by?: string;
}

const GoogleLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async (response: GoogleLoginResponse) => {
    const token = response.credential;
    if (token) {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts/google/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          router.push('/home');
        } else {
          console.error('Google login failed');
        }
      } catch (error) {
        console.error('Google login error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleLogin}
      useOneTap
      theme="filled_blue"
      size="large"
      shape="rectangular"
    />
  );
};

export default GoogleLoginButton;
