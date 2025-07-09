import { SignUp } from '@clerk/clerk-react';

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignUp path="/register" routing="path" />
    </div>
  );
}