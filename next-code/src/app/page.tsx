"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";

import LandingPage from "@/components/Landing";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  );
}
