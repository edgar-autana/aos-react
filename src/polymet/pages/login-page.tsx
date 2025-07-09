import { SignIn } from '@clerk/clerk-react';

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignIn path="/login" routing="path" />
    </div>
  );
}