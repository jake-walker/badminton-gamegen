import type { Metadata } from "next";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import AppShell from "@/components/AppShell";
import { Provider as JotaiProvider } from "jotai";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
  window
}: Readonly<{
  children: React.ReactNode;
  window?: () => Window;
}>) {
  return (
    <html lang="en">
      <body>
        <JotaiProvider>
          <AppRouterCacheProvider>
            <CssBaseline />
            <AppShell>
              {children}
            </AppShell>
          </AppRouterCacheProvider>
        </JotaiProvider>
      </body>
    </html>
  );
}