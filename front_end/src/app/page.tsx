'use client';

import React, { ReactNode } from 'react';
import Header from './componant/Header';
import Login from './componant/Login';
import Footer from './componant/Footer';
import { Provider } from "./src/components/ui/provider";
import { GoogleOAuthProvider } from '@react-oauth/google';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider>
        <div className="flex flex-col min-h-screen">
          <main className="relative flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow"> 
              <Login />
              {children}
            </div>
            <Footer />
          </main>
        </div>
      </Provider>
    </GoogleOAuthProvider>
  );
};

export default Layout;