import ReduxProvider from "@/provider/ReduxProvider";
import SessionWrapper from "@/provider/Session";
import "../styles/globals.scss";
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
 
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />

        <SessionWrapper>
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </SessionWrapper>

      </body>
    </html>
  );
}
