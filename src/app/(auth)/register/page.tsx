import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 p-4">
      <RegisterForm />
    </div>
  );
}
