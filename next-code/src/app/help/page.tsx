import React from "react";

const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/pilotype/dgigbnmdcejpknkgfgaoabglpfhocakh";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Troubleshooting
        </h1>
        <section className="bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Fix Extension Sign In Issue
          </h2>
          <div className="flex items-start bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded mb-6">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <span className="font-bold text-yellow-800">Known Issue:</span>
              <span className="text-yellow-800 ml-2">
                If you open the Chrome extension before signing in on the
                website, it may not sync correctly.
              </span>
            </div>
          </div>
          <p className="mb-4 text-gray-700">
            To resolve this, please follow these steps to uninstall and
            reinstall the extension:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
            <li>
              Open Chrome and go to{" "}
              <span className="font-mono bg-gray-100 px-1 rounded">
                chrome://extensions
              </span>
              .
            </li>
            <li>
              Find <span className="font-semibold">Pilotype</span> in your list
              of extensions.
            </li>
            <li>
              Click <span className="font-semibold">Remove</span> and confirm
              the removal.
            </li>
            <li>Visit the Chrome Web Store using the button below.</li>
            <li>
              Click <span className="font-semibold">Add to Chrome</span> to
              reinstall the extension.
            </li>
            <li>
              If you are already signed in on the website the problem should be
              fixed. If not, sign in on the website before opening the
              extension.
            </li>
          </ol>
          <div className="flex justify-center">
            <a
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-colors duration-200"
            >
              Go to Chrome Web Store
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
