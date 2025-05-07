import { SignedIn, SignedOut, useUser } from "@clerk/chrome-extension"
import { Link } from "react-router"

const syncHost = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST

export const Home = () => {
  const { user } = useUser()
  console.log("user", user)
  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "white",
        height: "100%",
        boxSizing: "border-box"
      }}>
      <SignedIn>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f3f4f6",
              borderRadius: "12px",
              border: "1px solid #e5e7eb"
            }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "12px"
              }}>
              Welcome Back, {user?.firstName || "User"}!
            </h2>
            <p
              style={{
                color: "#4b5563",
                fontSize: "14px",
                lineHeight: "1.5"
              }}>
              {user?.publicMetadata.plan === "none"
                ? ` Your AI assistant is unavailable. Please upgrade to a paid plan to use it.`
                : ` Your AI assistant is ready to help you write better content across
              the web.`}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#1f2937"
              }}>
              Quick Actions
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px"
              }}>
              <button
                style={{
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#4b5563",
                  textAlign: "left"
                }}>
                ✨ Upgrade
              </button>
              <Link to="/settings" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    padding: "12px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#4b5563",
                    textAlign: "left",
                    width: "100%"
                  }}>
                  ⚙️ Settings
                </button>
              </Link>
            </div>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: "24px",
            textAlign: "center"
          }}>
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "12px"
              }}>
              Welcome to AI Autocomplete
            </h1>
            <p
              style={{
                color: "#4b5563",
                fontSize: "14px",
                lineHeight: "1.5",
                maxWidth: "300px"
              }}>
              Get AI-powered writing suggestions as you type across the web.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
              maxWidth: "300px"
            }}>
            <button
              style={{
                padding: "12px",
                backgroundColor: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                width: "100%"
              }}
              onClick={() => {
                if (syncHost) {
                  window.open(`${syncHost}/sign-in`, "_blank")
                } else {
                  alert("Sign-in URL is not configured.")
                }
              }}>
              Get Started
            </button>
            <p
              style={{
                color: "#6b7280",
                fontSize: "12px"
              }}>
              Sign in to start using AI Autocomplete
            </p>
          </div>
        </div>
      </SignedOut>
    </div>
  )
}
