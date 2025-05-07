export const Settings = () => {
  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "white"
      }}>
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#111827",
          marginBottom: "16px"
        }}>
        Settings
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            padding: "16px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1f2937"
            }}>
            Account
          </h2>
          <p
            style={{
              color: "#4b5563",
              marginTop: "8px"
            }}>
            Manage your account settings
          </p>
        </div>
      </div>
    </div>
  )
}
