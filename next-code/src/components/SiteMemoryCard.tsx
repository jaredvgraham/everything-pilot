import React, { useState } from "react";
import { format } from "date-fns";
import { TrashIcon, ServerStackIcon } from "@heroicons/react/24/outline";

interface SiteMemoryCardProps {
  site: {
    siteId: string;
    siteName?: string;
    facts: string[];
    lastUpdated: string;
  };
  handleDeleteSiteMemory: (siteId: string) => void;
  handleDeleteSiteFact: (siteId: string, fact: string) => void;
}

const SiteMemoryCard = ({
  site,
  handleDeleteSiteMemory,
  handleDeleteSiteFact,
}: SiteMemoryCardProps) => {
  const [showMore, setShowMore] = useState(false);
  return (
    <div
      key={site.siteId}
      className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 shadow relative"
    >
      <button
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-red-50 transition-colors"
        title="Delete site memory"
        onClick={() => handleDeleteSiteMemory(site.siteId)}
      >
        <TrashIcon className="w-5 h-5 text-red-400 hover:text-red-600" />
      </button>
      <div className="font-bold text-cyan-700 mb-1 flex items-center gap-2">
        <ServerStackIcon className="w-5 h-5 text-cyan-400" />
        {site.siteName || site.siteId}
      </div>
      <div className="text-xs text-gray-500 mb-2">
        Last updated:{" "}
        {format(new Date(site.lastUpdated), "EEE, MMM d, yyyy h:mm a")}
      </div>
      <ul className="divide-y divide-gray-100">
        {site.facts.length === 0 ? (
          <li className="text-gray-400 italic py-2">
            No facts stored for this site.
          </li>
        ) : (
          <>
            {showMore
              ? site.facts.map((fact, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center py-2 group"
                  >
                    <div className="bg-slate-100 rounded-xl p-2 w-full flex justify-between items-center">
                      <span className="text-gray-700">{fact}</span>
                      <button
                        className="p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete fact"
                        onClick={() => handleDeleteSiteFact(site.siteId, fact)}
                      >
                        <TrashIcon className="w-4 h-4 text-red-400 hover:text-red-600" />
                      </button>
                    </div>
                  </li>
                ))
              : site.facts.slice(0, 2).map((fact, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center py-2 "
                  >
                    <div className="bg-slate-100 rounded-xl p-2 w-full flex justify-between items-center">
                      <span className="text-gray-700">{fact}</span>
                    </div>
                  </li>
                ))}
          </>
        )}
        {!showMore ? (
          <button
            className="text-cyan-500 hover:text-cyan-600 text-xs"
            onClick={() => setShowMore(true)}
          >
            Show more
          </button>
        ) : (
          <button
            className="text-cyan-500 hover:text-cyan-600 text-xs"
            onClick={() => setShowMore(false)}
          >
            Show less
          </button>
        )}
      </ul>
    </div>
  );
};

export default SiteMemoryCard;
