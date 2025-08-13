"use client";
import { SignIn } from "@clerk/nextjs";

export default function ExtensionLoginPage() {
  return (
    <main className="pt-24 pb-12 px-6 min-h-[calc(100vh-4rem)]">
      <div className="max-w-sm mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in or Sign up</h1>
        <SignIn />

        <p className="mt-4 text-sm text-gray-500">
          After signing in, this window will close automatically.
        </p>
      </div>
    </main>
  );
}
