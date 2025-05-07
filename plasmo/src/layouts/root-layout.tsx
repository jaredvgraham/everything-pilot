import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/chrome-extension"
import { Link, Outlet, useNavigate } from "react-router"

const PUBLISHABLE_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY
const SYNC_HOST = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST

if (!PUBLISHABLE_KEY || !SYNC_HOST) {
  throw new Error(
    "Please add the PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY or PLASMO_PUBLIC_CLERK_SYNC_HOST to the .env.development file"
  )
}

export const RootLayout = () => {
  const navigate = useNavigate()

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} syncHost={SYNC_HOST}>
      <div
        style={{
          width: "400px",
          height: "600px",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column"
        }}>
        <main
          style={{
            flex: 1,
            overflow: "auto"
          }}>
          <Outlet />
        </main>
        <footer
          style={{
            height: "48px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            backgroundColor: "#f9fafb",
            flexShrink: 0
          }}>
          <SignedIn>
            <Link
              to="/settings"
              style={{
                fontSize: "14px",
                color: "#4b5563",
                textDecoration: "none"
              }}>
              Settings
            </Link>
            <UserButton />
          </SignedIn>
        </footer>
      </div>
    </ClerkProvider>
  )
}
