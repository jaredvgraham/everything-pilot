"use client";
import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
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
