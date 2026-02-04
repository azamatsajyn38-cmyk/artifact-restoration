import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 p-4">
      <LoginForm />
    </div>
  );
}
