"use client";

import { useEffect, useState } from "react";

type TokenStatus = {
  valid: boolean;
  expiresAt: string | null;
  appId: string;
};

export function MetaTokenStatus() {
  const [status, setStatus] = useState<TokenStatus | null>(null);

  useEffect(() => {
    fetch("/api/meta/token-status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ valid: false, expiresAt: null, appId: "" }));
  }, []);

  if (!status) return null;

  const daysLeft = status.expiresAt
    ? Math.floor((new Date(status.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiringSoon = daysLeft !== null && daysLeft <= 7;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        padding: "4px 10px",
        borderRadius: 20,
        background: status.valid ? (isExpiringSoon ? "#fef3c7" : "#d1fae5") : "#fee2e2",
        color: status.valid ? (isExpiringSoon ? "#92400e" : "#065f46") : "#991b1b",
        fontWeight: 500,
        marginBottom: 12
      }}
    >
      <span>{status.valid ? "●" : "○"}</span>
      {status.valid
        ? daysLeft !== null
          ? `Meta token valid · expiră în ${daysLeft} zile`
          : "Meta token valid"
        : "Meta token invalid sau lipsă — verifică META_ACCESS_TOKEN"}
    </div>
  );
}
