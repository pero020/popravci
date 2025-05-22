import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import MainNavigation from "@/components/main-navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Popravci - Find the Right Professional for Your Job",
  description: "Connect with skilled craftsmen and service providers for your home and business needs",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col items-center">
              <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="w-full max-w-7xl mx-auto flex justify-between items-center p-4">
                  <div className="flex items-center">
                    <Link href={"/"} className="font-bold text-xl text-primary mr-8">
                      Popravci
                    </Link>
                    <MainNavigation />
                  </div>
                  <div className="flex items-center gap-4">
                    {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                  </div>
                </div>
              </header>
              
              <div className="w-full max-w-7xl py-8 px-4 md:px-6">
                {children}
              </div>

              <footer className="w-full bg-slate-50 border-t border-slate-200 mt-auto">
                <div className="max-w-7xl mx-auto py-10 px-4 md:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                      <h3 className="font-bold text-lg mb-4">Popravci</h3>
                      <p className="text-slate-600 text-sm">
                        Find the right professionals for all your repair and maintenance needs.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Quick Links</h4>
                      <ul className="space-y-2">
                        <li><Link href="/" className="text-slate-600 hover:text-primary text-sm">Home</Link></li>
                        <li><Link href="/majstori" className="text-slate-600 hover:text-primary text-sm">Find Professionals</Link></li>
                        <li><Link href="/protected" className="text-slate-600 hover:text-primary text-sm">My Account</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Legal</h4>
                      <ul className="space-y-2">
                        <li><Link href="#" className="text-slate-600 hover:text-primary text-sm">Terms of Service</Link></li>
                        <li><Link href="#" className="text-slate-600 hover:text-primary text-sm">Privacy Policy</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Contact</h4>
                      <p className="text-slate-600 text-sm mb-2">Need help? Contact our support team.</p>
                      <a href="mailto:support@popravci.com" className="text-primary hover:underline text-sm">support@popravci.com</a>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-slate-500 text-sm">
                      © {new Date().getFullYear()} Popravci. All rights reserved.
                    </p>
                    <p className="text-slate-500 text-sm mt-4 md:mt-0">
                      Powered by{" "}
                      <a
                        href="https://supabase.com"
                        target="_blank"
                        className="text-primary hover:underline"
                        rel="noreferrer"
                      >
                        Supabase
                      </a>
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
