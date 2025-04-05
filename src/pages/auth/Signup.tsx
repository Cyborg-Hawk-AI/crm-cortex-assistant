
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4 py-12 bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">aAction.it</h1>
        <p className="text-muted-foreground mt-2">Create a new account</p>
      </div>
      <SignupForm />
    </div>
  );
}
