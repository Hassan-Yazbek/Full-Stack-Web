'use client';

import React, { ReactNode } from 'react';
import Header from './componant/Header';
import Login from './componant/Login';
import Footer from './componant/Footer';
import { GoogleOAuthProvider } from '@react-oauth/google';


interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '632397976693-9jfm4diokif5eakpumo9ajheon93f3hb.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex flex-col min-h-screen">
        <main className="relative flex flex-col min-h-screen">
          <Header />
          <div className="flex-grow "> 
            <Login />
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Layout;