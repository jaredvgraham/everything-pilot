"use client";

import { useState } from "react";

const plans = [
  {
    name: "Basic",
    price: 5,
    planKey: "basic",
    features: [
      "Core autocomplete features",
      "Up to 1000 completions/month",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: 15,
    planKey: "pro",
    features: [
      "All Basic features",
      "Unlimited completions",
      "Priority support",
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
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: 24,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        Pricing
      </h1>
      <p style={{ color: "#555", marginBottom: 32 }}>
        Choose the plan that fits your needs. Cancel anytime.
      </p>
      <div
        style={{
          display: "flex",
          gap: 32,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.planKey}
            style={{
              flex: "1 1 250px",
              minWidth: 250,
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 24,
              background: "#f9fafb",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h2 style={{ fontSize: 24, fontWeight: 600 }}>{plan.name}</h2>
            <div style={{ fontSize: 36, fontWeight: 700, margin: "16px 0" }}>
              ${plan.price}
              <span style={{ fontSize: 16, fontWeight: 400 }}>/mo</span>
            </div>
            <ul style={{ textAlign: "left", marginBottom: 24 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ marginBottom: 8, color: "#374151" }}>
                  • {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.planKey)}
              disabled={loading === plan.planKey}
              style={{
                padding: "12px 32px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 600,
                cursor: loading === plan.planKey ? "not-allowed" : "pointer",
                width: "100%",
              }}
            >
              {loading === plan.planKey
                ? "Redirecting..."
                : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
      {error && (
        <div
          style={{
            marginTop: 24,
            color: "#dc2626",
            background: "#fee2e2",
            padding: 12,
            borderRadius: 6,
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
