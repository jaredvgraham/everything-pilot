"use client";
import { SignIn, SignUp, useSession } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export default function ExtensionLoginPage() {
  console.log("signup page");
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { session } = useSession();
  console.log("session", session);
  useEffect(() => {
    const sendTokenToExtension = async () => {
      if (!isLoaded || !isSignedIn) return;

      let token = await getToken({ template: "extension" });
      if (!token && session) {
        token = await session.getToken();
      }

      if (!token) {
        console.log("no token found");
        return;
      }

      // Send token to extension
      try {
        window.opener?.postMessage(
          { type: "CLERK_EXTENSION_AUTH", token },
          "*"
        );
        console.log("posting token to extension");
      } catch (error) {
        console.log("error posting token to extension", error);
      }

      window.close(); // Optional auto-close
    };

    sendTokenToExtension();
  }, [isLoaded, isSignedIn, session]);

  return (
    <main className="pt-24 pb-12 px-6 min-h-[calc(100vh-4rem)]">
      <div className="max-w-sm mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in or Sign up</h1>
        <SignUp forceRedirectUrl={"/"} />

        <p className="mt-4 text-sm text-gray-500">
          After signing in, this window will close automatically.
        </p>
      </div>
    </main>
  );
}
