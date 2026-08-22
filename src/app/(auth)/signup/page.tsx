import SignupForm from "@/components/auth/signup-form";

export const metadata = { title: "Dayflow - Create Account" };

export default function SignupPage() {
  return (
    <div className="bg-background text-on-surface min-h-screen flex items-center justify-center p-gutter font-body-md py-12">
      <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-xl shadow-sm flex flex-col gap-lg relative overflow-hidden">
        {/* Minimal Graphic Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />

        {/* Card Header */}
        <div className="text-center flex flex-col items-center gap-sm">
          <div className="w-12 h-12 bg-primary text-on-primary rounded-lg flex items-center justify-center mb-xs">
            <span className="material-symbols-outlined text-[28px]">hub</span>
          </div>
          <h1 className="font-display text-display text-primary">Dayflow</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Create a new organization account
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}