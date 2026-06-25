import React from 'react';

export default function Loader({ message = "Consulting Study Buddy AI..." }) {
  return (
    <div className="loader-container fade-in">
      <div className="spinner"></div>
      <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{message}</p>
    </div>
  );
}
