import SignupForm from "@/components/auth/signup-form";

export const metadata = { title: "Create your company — Dayflow" };

export default function SignupPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 py-10">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-slate-900">Create your company</h1>
        <p className="mb-6 text-sm text-slate-500">
          You&apos;ll be its first admin. Add your team in the next step.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}