import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "./src/components/ui/provider";
import { AuthProvider } from "./AuthContext"; // Import the AuthProvider

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <html suppressHydrationWarning>
      <body>
        <Provider>
          <AuthProvider> {/* Wrap children with AuthProvider */}
            {children}
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}