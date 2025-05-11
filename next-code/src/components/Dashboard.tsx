"use client";
import React, { useEffect, useState } from "react";

export interface UserMemory {
  facts: string[];
  lastUpdated: string;
}

export interface SiteMemory {
  siteId: string;
  siteName?: string;
  facts: string[];
  lastUpdated: string;
}

interface DashboardData {
  requestCount: number;
  userMemory: UserMemory;
  siteMemories: SiteMemory[];
  monthlyCompletions: number;
}

const MONTHLY_LIMIT = 1000;

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }
  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }
  if (!data) return null;

  const { requestCount, userMemory, siteMemories, monthlyCompletions } = data;
  const percent = Math.min((monthlyCompletions / MONTHLY_LIMIT) * 100, 100);
  const overLimit = monthlyCompletions > MONTHLY_LIMIT;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Dashboard</h1>

      {/* Monthly Suggestions Progress Bar */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">
          Monthly Suggestions
        </h2>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-lg font-semibold ${
                overLimit ? "text-red-600" : "text-cyan-600"
              }`}
            >
              {monthlyCompletions.toLocaleString()} /{" "}
              {MONTHLY_LIMIT.toLocaleString()} suggestions this month
            </span>
            {overLimit && (
              <span className="text-xs text-red-600 font-bold ml-2">
                Limit Exceeded
              </span>
            )}
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                overLimit
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-cyan-400 to-cyan-500"
              }`}
              style={{ width: percent + "%" }}
            ></div>
          </div>
        </div>
      </section>

      {/* Request Usage */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Usage</h2>
        <div className="bg-white rounded-xl shadow p-6 flex items-center">
          <span className="text-3xl font-bold text-cyan-600 mr-2">
            {requestCount}
          </span>
          <span className="text-lg text-gray-700">requests made</span>
        </div>
      </section>

      {/* User Memory */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">
          Your Memory
        </h2>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500 mb-2">
            Last updated: {new Date(userMemory.lastUpdated).toLocaleString()}
          </div>
          <ul>
            {userMemory.facts.length === 0 ? (
              <li className="text-gray-400 italic">No facts stored.</li>
            ) : (
              userMemory.facts.map((fact, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center border-b last:border-b-0 py-2"
                >
                  <span>{fact}</span>
                  <button className="text-red-500 hover:underline text-xs">
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
          {userMemory.facts.length > 0 && (
            <button className="mt-4 text-sm text-red-600 hover:underline">
              Clear All
            </button>
          )}
        </div>
      </section>

      {/* Site Memories */}
      <section>
        <h2 className="text-xl font-semibold mb-2 text-gray-900">
          Site Memories
        </h2>
        {siteMemories.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-gray-400 italic">
            No site memories stored.
          </div>
        ) : (
          siteMemories.map((site) => (
            <div
              key={site.siteId}
              className="bg-white rounded-xl shadow p-6 mb-6"
            >
              <div className="font-bold text-cyan-600 mb-1">
                {site.siteName || site.siteId}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Last updated: {new Date(site.lastUpdated).toLocaleString()}
              </div>
              <ul>
                {site.facts.length === 0 ? (
                  <li className="text-gray-400 italic">
                    No facts stored for this site.
                  </li>
                ) : (
                  site.facts.map((fact, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center border-b last:border-b-0 py-2"
                    >
                      <span>{fact}</span>
                      <button className="text-red-500 hover:underline text-xs">
                        Delete
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Dashboard;
