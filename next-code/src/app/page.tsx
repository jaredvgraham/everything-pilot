"use client";
import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import LandingPage from "@/components/Landing";

export default function Home() {
  return (
    <>
      <SignedIn>
        <LandingPage />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  );
}
