// GoogleLoginButton.tsx
'use client';

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = () => {
  const handleGoogleLogin = async (response: any) => {
    const token = response.credential;  // The token received after successful login
    if (token) {
      try {
        const res = await fetch('http://localhost:5000/api/accounts/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          // Handle success, e.g., redirect to the home page
          console.log('Login successful');
        } else {
          console.error('Google login failed');
        }
      } catch (error) {
        console.error('Google login error:', error);
      }
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleLogin}
      onError={() => console.error('Google login failed')}
      useOneTap
    />
  );
};

export default GoogleLoginButton;
