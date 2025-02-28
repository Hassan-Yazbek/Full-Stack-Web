'use client';

import React, { ReactNode } from 'react';
import Header from './componant/Header';
import Login from './componant/Login';
import Footer from './componant/Footer';
import { Provider } from "./src/components/ui/provider";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './AuthContext'; // Import the AuthProvider
import { usePathname } from 'next/navigation'; // Import usePathname to determine the current route

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const pathname = usePathname(); // Get the current route

  // Determine the page prop for the Header
  const page = pathname === '/home' ? 'home' : 'login';

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider>
        <AuthProvider> {/* Wrap everything with AuthProvider */}
          <div className="flex flex-col min-h-screen">
            <main className="relative flex flex-col min-h-screen">
              <Header page={page} /> {/* Pass the page prop dynamically */}
              <div className="flex-grow"> 
                {pathname === '/' && <Login />} {/* Render Login only on the root route */}
                {children}
              </div>
              <Footer />
            </main>
          </div>
        </AuthProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
};

export default Layout;