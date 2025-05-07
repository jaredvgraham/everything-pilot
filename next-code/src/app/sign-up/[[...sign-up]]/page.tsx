"use client";
import { SignUp } from "@clerk/nextjs";

export default function ExtensionLoginPage() {
  return (
    <main className="p-6 text-center max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign in or Sign up</h1>
      <SignUp />

      <p className="mt-4 text-sm text-gray-500">
        After signing in, this window will close automatically.
      </p>
    </main>
  );
}
