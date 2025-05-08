"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import PricingPage from "@/app/pricing/page";

const AutocompleteDemo = () => {
  const [text, setText] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  const demoText = "How much faster does this";
  const demoSuggestion = "extension make me?";

  useEffect(() => {
    let currentIndex = 0;
    let suggestionTimeout: NodeJS.Timeout;

    const typeText = () => {
      if (currentIndex < demoText.length) {
        setText(demoText.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeText, 100);
      } else {
        setIsTyping(false);
        suggestionTimeout = setTimeout(() => {
          setShowSuggestion(true);
          let suggestionIndex = 0;
          const typeSuggestion = () => {
            if (suggestionIndex < demoSuggestion.length) {
              setSuggestion(demoSuggestion.slice(0, suggestionIndex + 1));
              suggestionIndex++;
              setTimeout(typeSuggestion, 50);
            }
          };
          typeSuggestion();
        }, 500);
      }
    };

    typeText();

    return () => {
      clearTimeout(suggestionTimeout);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 bg-white rounded-xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>
      <div className="font-mono text-lg">
        <span className="text-gray-800">{text}</span>
        {!isTyping && showSuggestion && (
          <span className="text-indigo-600 ml-2">{suggestion}</span>
        )}
        <span className="animate-pulse">|</span>
      </div>
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Supercharge Your Browsing with
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            {" "}
            AI Autocomplete
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Experience the future of web browsing with our intelligent AI-powered
          autocomplete extension. Save time and boost productivity with smart
          suggestions that learn from your behavior.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
            Add to Chrome
          </button>
          <button className="border border-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow">
            Learn More
          </button>
        </div>
        <AutocompleteDemo />
      </div>

      {/* Features Section */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        id="features"
      >
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Lightning Fast
            </h3>
            <p className="text-gray-600">
              Get instant suggestions as you type, powered by advanced AI
              algorithms.
            </p>
          </div>
          <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Smart Learning
            </h3>
            <p className="text-gray-600">
              Adapts to your writing style and preferences over time for
              personalized suggestions.
            </p>
          </div>
          <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Privacy First
            </h3>
            <p className="text-gray-600">
              Your data stays on your device. We never store or share your
              personal information.
            </p>
          </div>
        </div>
      </div>
      <div className="text-center group hover:transform hover:scale-105 transition-all duration-300 min-w-full ">
        <PricingPage />
      </div>
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Ready to Transform Your Browsing Experience?
          </h2>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl">
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
