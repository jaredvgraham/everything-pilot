"use client";

import { useState } from "react";
import { CheckIcon, XMarkIcon, ArrowUpIcon } from "@heroicons/react/24/solid";

const plans = [
  {
    name: "Basic",
    price: 5,
    planKey: "basic",
    features: [
      { text: "Core autocomplete features", available: true },
      { text: "Up to 1000 completions/month", available: true },
      { text: "Email support", available: true },
      { text: "Unlimited completions", available: false },
      { text: "Priority support", available: false },
    ],
  },
  {
    name: "Pro",
    price: 15,
    planKey: "pro",
    features: [
      { text: "Core autocomplete features", available: true },
      { text: "Up to 1000 completions/month", available: true },
      { text: "Email support", available: true },
      { text: "Unlimited completions", available: true },
      { text: "Priority support", available: true },
    ],
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (plan: string) => {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || "Failed to create checkout session.");
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-600">
            Choose the plan that fits your needs. Cancel anytime.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto px-4">
          {plans.map((plan) => (
            <div
              key={plan.planKey}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 bg-white ${
                plan.planKey === "pro"
                  ? "border-2 border-indigo-500 relative"
                  : "border border-gray-200"
              }`}
            >
              {plan.planKey === "pro" && (
                <div className="absolute top-0 right-5 -translate-y-1/2 translate-x-1/2 ">
                  <span className="inline-flex rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1 text-sm font-semibold text-white">
                    Popular
                  </span>
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {plan.name}
                </h2>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    /month
                  </span>
                </p>
                <button
                  onClick={() => handleSubscribe(plan.planKey)}
                  disabled={loading === plan.planKey}
                  className={`mt-8 block w-full rounded-lg border border-transparent px-6 py-3 text-center text-base font-medium text-white ${
                    plan.planKey === "pro"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                  } transition-all shadow-lg hover:shadow-xl`}
                >
                  {loading === plan.planKey
                    ? "Redirecting..."
                    : `Get started with ${plan.name}`}
                </button>
                {plan.planKey === "basic" && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      <span className="inline-flex items-center text-indigo-600 font-medium">
                        <ArrowUpIcon className="h-4 w-4 mr-1" />
                        Upgrade to Pro anytime
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex space-x-3">
                      {feature.available ? (
                        <CheckIcon
                          className="flex-shrink-0 h-5 w-5 text-indigo-600"
                          aria-hidden="true"
                        />
                      ) : (
                        <XMarkIcon
                          className="flex-shrink-0 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={`text-sm ${
                          feature.available ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                {plan.planKey === "basic" && (
                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-indigo-700">
                      Need more? Upgrade to Pro anytime to unlock unlimited
                      completions and priority support.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-8 max-w-xl mx-auto">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
