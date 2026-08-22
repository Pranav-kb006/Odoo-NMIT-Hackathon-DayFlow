import LoginForm from "@/components/auth/login-form";

export const metadata = { title: "Sign in — Dayflow" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
        <p className="mb-6 text-sm text-slate-500">Welcome back. Every workday, perfectly aligned.</p>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}