"use client";
import { SignIn } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export default function ExtensionLoginPage() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    const sendTokenToExtension = async () => {
      if (!isLoaded || !isSignedIn) return;

      const token = await getToken({ template: "extension" });
      if (!token) return;

      // Send token to extension
      window.opener?.postMessage({ type: "CLERK_EXTENSION_AUTH", token }, "*");
      window.close(); // Optional auto-close
    };

    sendTokenToExtension();
  }, [isLoaded, isSignedIn]);

  return (
    <main className="p-6 text-center max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign in or Sign up</h1>
      <SignIn path="/extension-login" />
      <p className="mt-4 text-sm text-gray-500">
        After signing in, this window will close automatically.
      </p>
    </main>
  );
}
