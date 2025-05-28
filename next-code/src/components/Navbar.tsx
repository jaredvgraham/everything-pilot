"use client";
import React, { useState } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  const navigationSignedOut = [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Help", href: "/help" },
  ];
  const navigationSignedIn = [
    { name: "Dashboard", href: "/" },
    { name: "Settings", href: "/settings" },
    { name: "Help", href: "/help" },
  ];

  return (
    <nav className="bg-white/20 backdrop-blur-md shadow-md border-b border-gray-50 fixed w-full z-50 ">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center h-16">
              <Image
                src={"/pilotype-logo-t.png"}
                alt="Pilotype Logo"
                width={32}
                height={32}
                quality={100}
                style={{ objectFit: "contain" }}
              />
            </div>
          </Link>

          {/* Centered Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex space-x-8">
              {(isSignedIn ? navigationSignedIn : navigationSignedOut).map(
                (item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:text-cyan-600 px-3 py-2 text-base font-semibold tracking-wide transition-colors"
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Secondary nav */}
          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-gray-700 hover:text-cyan-600 px-3 py-2 text-base font-semibold tracking-wide transition-colors"
                >
                  Sign in
                </Link>
                <button
                  onClick={() => {
                    window.open(
                      "https://chromewebstore.google.com/detail/pilotype/dgigbnmdcejpknkgfgaoabglpfhocakh"
                    );
                  }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-400"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {(isSignedIn ? navigationSignedIn : navigationSignedOut).map(
              (item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-cyan-600 block px-3 py-2 text-base font-semibold tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            )}
            {!isSignedIn && (
              <>
                <Link
                  href="/sign-in"
                  className="text-gray-700 hover:text-cyan-600 block px-3 py-2 text-base font-semibold tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-white block px-3 py-2 text-base font-semibold uppercase tracking-wide rounded-lg hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
