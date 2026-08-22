import LoginForm from "@/components/auth/login-form";

export const metadata = { title: "Dayflow - Sign In" };

export default function LoginPage() {
  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-4">
      {/* Top Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-center items-center px-margin py-md w-full max-w-full mx-auto">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary font-bold text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              hub
            </span>
            <h1 className="font-display text-headline-lg font-bold text-primary tracking-tight">
              Dayflow
            </h1>
          </div>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="w-full max-w-[440px] mt-[80px]">
        <div className="bg-surface-container-lowest border border-secondary-fixed rounded-xl p-xl shadow-[0px_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center">
          <div className="mb-xl text-center">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
              Welcome Back
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Sign in to access your HR dashboard.
            </p>
          </div>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}