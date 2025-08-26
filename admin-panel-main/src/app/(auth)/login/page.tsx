
import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'ورود - پنل مدیریت یووتاب', // Login - Reservista Admin
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-bl from-primary/10 via-background to-background p-4"> {/* from-primary/10 to-br changed to to-bl for RTL aesthetics */}
      <LoginForm />
    </div>
  );
}
