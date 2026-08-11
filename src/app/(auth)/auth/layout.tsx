import { Toaster } from "sonner";


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div  >
      <Toaster closeButton position="top-right" />
      {children}
    </div>
  );
}
