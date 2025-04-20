
import SignupForm from '@/components/auth/SignupForm';
import { Logo } from '@/components/Logo';

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4 py-12 bg-background">
      <div className="mb-8 text-center flex flex-col items-center">
        <Logo className="mb-4" />
        <h1 className="text-[#404040] text-3xl font-bold mt-2">Create a New Account</h1>
        <p className="text-muted-foreground mt-2">Get started with Action.it</p>
      </div>
      <SignupForm />
    </div>
  );
}
