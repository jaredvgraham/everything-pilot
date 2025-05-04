import React from "react";

export default function TestInputPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Test Input Page</h1>
      <div style={{ margin: "20px 0" }}>
        <label htmlFor="test-input">Text Input:</label>
        <input
          id="test-input"
          type="text"
          placeholder="Type here..."
          style={{ display: "block", width: 300, marginTop: 8, padding: 8 }}
        />
      </div>
      <div style={{ margin: "20px 0" }}>
        <label htmlFor="test-textarea">Textarea:</label>
        <textarea
          id="test-textarea"
          placeholder="Type here..."
          style={{
            display: "block",
            width: 300,
            height: 100,
            marginTop: 8,
            padding: 8,
          }}
        />
      </div>
    </div>
  );
}
