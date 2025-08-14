"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  UserCircleIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ServerStackIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@clerk/nextjs";
import SiteMemoryCard from "./SiteMemoryCard";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

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

const AVATAR_URL =
  "https://ui-avatars.com/api/?name=User&background=cyan&color=fff&size=128";

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const MONTHLY_LIMIT = user?.publicMetadata.plan === "basic" ? 1000 : 5000;
  const router = useRouter();
  const [newMemory, setNewMemory] = useState<string>("");
  const [adding, setAdding] = useState<boolean>(false);
  // TODO: Uncomment this when we want a plan system
  // if (user?.publicMetadata.plan === "none") {
  //   router.push("/pricing");
  // }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        console.log("json", json);
        setData(json);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteUserFact = async (fact: string) => {
    setDeleting(`user-fact-${fact}`);
    try {
      const res = await fetch(`/api/dashboard`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fact }),
      });
      if (!res.ok) throw new Error("Failed to delete fact");
      const json = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              userMemory: {
                ...prev.userMemory,
                facts: json.facts,
                lastUpdated: json.lastUpdated,
              },
            }
          : prev
      );
    } catch (err) {
      setError("Failed to delete user fact");
    } finally {
      setDeleting(null);
    }
  };

  const handleClearAllUserFacts = async () => {
    setDeleting("user-clear-all");
    try {
      const res = await fetch("/api/dashboard/user-memory", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to clear all facts");
      const json = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              userMemory: {
                ...prev.userMemory,
                facts: json.facts,
                lastUpdated: json.lastUpdated,
              },
            }
          : prev
      );
    } catch (err) {
      setError("Failed to clear all user facts");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteSiteFact = async (siteId: string, fact: string) => {
    setDeleting(`site-fact-${siteId}-${fact}`);
    try {
      const res = await fetch(`/api/dashboard/site-memory/${siteId}/fact`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fact }),
      });
      if (!res.ok) throw new Error("Failed to delete site fact");
      const json = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              siteMemories: prev.siteMemories.map((site) =>
                site.siteId === siteId
                  ? {
                      ...site,
                      facts: json.facts,
                      lastUpdated: json.lastUpdated,
                    }
                  : site
              ),
            }
          : prev
      );
    } catch (err) {
      setError("Failed to delete site fact");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteSiteMemory = async (siteId: string) => {
    setDeleting(`site-memory-${siteId}`);
    try {
      const res = await fetch(`/api/dashboard/site-memory/${siteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete site memory");
      setData((prev) =>
        prev
          ? {
              ...prev,
              siteMemories: prev.siteMemories.filter(
                (site) => site.siteId !== siteId
              ),
            }
          : prev
      );
    } catch (err) {
      setError("Failed to delete site memory");
    } finally {
      setDeleting(null);
    }
  };

  const handleAddNewMemory = async () => {
    const fact = newMemory.trim();
    if (!fact) return;
    if (fact.length > 500) {
      setError("Fact too long (max 500 characters)");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/user-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fact }),
      });
      if (!res.ok) {
        let message = "Failed to add new memory";
        try {
          const j = await res.json();
          if (j?.error) message = j.error;
        } catch {}
        throw new Error(message);
      }
      const json = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              userMemory: {
                ...prev.userMemory,
                facts: json.facts,
                lastUpdated: json.lastUpdated,
              },
            }
          : prev
      );
      setNewMemory("");
    } catch (err: any) {
      setError(err?.message || "Failed to add new memory");
    } finally {
      setAdding(false);
    }
  };

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
    <div className="max-w-6xl mx-auto py-24 px-2 md:px-8">
      {/* Modern Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-3xl p-8 shadow-lg relative overflow-hidden">
        <div>
          {user?.publicMetadata.plan === "none" ? (
            <>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                Subscribe to get completions!
              </h1>

              <button
                className="bg-cyan-600 text-white px-4 py-2 rounded-md"
                onClick={() => router.push("/pricing")}
              >
                Subscribe
              </button>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                Welcome back!
              </h1>
              <p className="text-lg text-gray-500">
                Here's your productivity dashboard for this month.
              </p>
            </>
          )}
        </div>
        <img
          src={AVATAR_URL}
          alt="User Avatar"
          className="w-24 h-24 rounded-full border-4 border-cyan-200 shadow-lg mt-6 md:mt-0"
        />
        <div className="absolute right-0 top-0 opacity-10 text-cyan-200 pointer-events-none select-none">
          <ChartBarIcon className="w-40 h-40" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Monthly Suggestions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-3 hover:shadow-2xl transition-shadow group relative overflow-hidden">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-cyan-500 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-semibold text-gray-900">
              Monthly Suggestions
            </span>
          </div>
          <span
            className={`text-2xl font-bold ${
              overLimit ? "text-red-600" : "text-cyan-600"
            }`}
          >
            {monthlyCompletions.toLocaleString()} /{" "}
            {MONTHLY_LIMIT.toLocaleString()}
          </span>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                overLimit
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-cyan-400 to-cyan-500"
              }`}
              style={{ width: percent + "%" }}
            ></div>
          </div>
          {overLimit && (
            <span className="text-xs text-red-600 font-bold mt-2">
              Limit Exceeded
            </span>
          )}
        </div>
        {/* Usage */}
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-3 hover:shadow-2xl transition-shadow group relative overflow-hidden">
          <div className="flex items-center gap-3">
            <ClipboardDocumentListIcon className="w-8 h-8 text-cyan-500 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-semibold text-gray-900">Usage</span>
          </div>
          <span className="text-2xl font-bold text-cyan-600">
            {requestCount}
          </span>
          <span className="text-gray-500">requests made</span>
        </div>
        {/* User Memory Count */}
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-3 hover:shadow-2xl transition-shadow group relative overflow-hidden">
          <div className="flex items-center gap-3">
            <ServerStackIcon className="w-8 h-8 text-cyan-500 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-semibold text-gray-900">
              Your Memory
            </span>
            {userMemory.facts.length >= 100 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-700 border border-red-200 animate-pulse">
                FULL
              </span>
            )}
          </div>
          <span className="text-2xl font-bold text-cyan-600">
            {userMemory.facts.length}
          </span>
          <span className="text-gray-500">facts stored</span>
          {userMemory.facts.length >= 100 && (
            <span className="text-xs text-red-600 font-semibold mt-1">
              Your memory is full. Delete some facts to add new ones.
            </span>
          )}
        </div>
      </div>

      {/* Memory Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* User Memory */}
        <section className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-2 hover:shadow-2xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <UserCircleIcon className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-gray-900">Your Memory</h2>

            {userMemory.facts.length >= 100 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-700 border border-red-200 animate-pulse">
                FULL
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Last updated:{" "}
            {format(
              new Date(userMemory.lastUpdated),
              "EEE, MMM d, yyyy h:mm a"
            )}
          </div>
          {/* Add new memory input */}
          <div className="">
            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-cyan-400/30 to-blue-500/30">
              <div className="relative flex items-center gap-3 bg-white rounded-2xl px-4 py-2 shadow-sm focus-within:shadow-lg transition">
                <span className="pointer-events-none text-cyan-500">✨</span>
                <input
                  type="text"
                  value={newMemory}
                  onChange={(e) => setNewMemory(e.target.value)}
                  placeholder="Add a new memory (e.g., role, interest, goal)"
                  maxLength={500}
                  className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-800"
                  disabled={adding || userMemory.facts.length >= 100}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNewMemory();
                    }
                  }}
                />
                <button
                  className={`px-4 py-2 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition ${
                    adding
                      ? "bg-cyan-300"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                  onClick={handleAddNewMemory}
                  disabled={adding || userMemory.facts.length >= 100}
                  title={
                    userMemory.facts.length >= 100
                      ? "Your memory is full. Delete some facts to add new ones."
                      : "Add memory"
                  }
                >
                  {adding ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Add concise, persistent facts (role, interest, goal)</span>
              <span>{newMemory.length}/100</span>
            </div>
          </div>
          {userMemory.facts.length >= 100 && (
            <div className="text-xs text-red-600 font-semibold mb-2">
              Your user memory is full. Delete facts to make space for new ones.
            </div>
          )}
          <ul className="divide-y divide-gray-100">
            {userMemory.facts.length === 0 ? (
              <li className="text-gray-400 italic py-4">No facts stored.</li>
            ) : (
              userMemory.facts.map((fact, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center py-3 group"
                >
                  <span className="text-gray-700">{fact}</span>
                  <button
                    className="p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete fact"
                    onClick={() => handleDeleteUserFact(fact)}
                  >
                    <TrashIcon className="w-4 h-4 text-red-400 hover:text-red-600" />
                  </button>
                </li>
              ))
            )}
          </ul>

          {userMemory.facts.length > 0 && (
            <button
              className="mt-4 text-sm text-red-600 hover:underline font-semibold self-end"
              title="Clear all facts"
              onClick={handleClearAllUserFacts}
            >
              Clear All
            </button>
          )}
        </section>

        {/* Site Memories */}
        <section className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 hover:shadow-2xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <ServerStackIcon className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-gray-900">Site Memories</h2>
          </div>
          {/* search bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search site memories"
              className="w-full p-2 rounded-md border border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {siteMemories.length === 0 ? (
            <div className="text-gray-400 italic py-4">
              No site memories stored.
            </div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
              {(searchQuery
                ? siteMemories.filter((site) =>
                    site.siteName
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                : siteMemories
              ).map((site) => (
                <SiteMemoryCard
                  key={site.siteId}
                  site={site}
                  handleDeleteSiteMemory={handleDeleteSiteMemory}
                  handleDeleteSiteFact={handleDeleteSiteFact}
                />
              ))}
            </div>
          )}
        </section>
      </div>
      {/* Help Callout */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="flex items-center bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow">
          <span className="text-2xl mr-3">🆘</span>
          <div>
            <span className="font-bold text-yellow-800">
              Trouble with the extension?
            </span>
            <span className="ml-2 text-yellow-800">Visit our </span>
            <a
              href="/help"
              className="text-blue-600 font-semibold underline hover:text-blue-800"
            >
              Help page
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
