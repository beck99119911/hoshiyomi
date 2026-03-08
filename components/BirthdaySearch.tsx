"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BirthdaySearch() {
  const router = useRouter();
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!month || !day) return;
    const mmdd = `${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
    router.push(`/birthday/${mmdd}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end justify-center">
      <div className="flex gap-2">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-3 text-sm text-center appearance-none focus:outline-none"
          style={{
            background: "rgba(212,168,76,0.04)",
            border: "1px solid rgba(212,168,76,0.25)",
            color: month ? "#f0e8d8" : "rgba(240,232,216,0.3)",
            minWidth: "72px",
          }}
        >
          <option value="">月</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1} style={{ background: "#0d0e20" }}>
              {i + 1}月
            </option>
          ))}
        </select>
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="px-3 py-3 text-sm text-center appearance-none focus:outline-none"
          style={{
            background: "rgba(212,168,76,0.04)",
            border: "1px solid rgba(212,168,76,0.25)",
            color: day ? "#f0e8d8" : "rgba(240,232,216,0.3)",
            minWidth: "72px",
          }}
        >
          <option value="">日</option>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i + 1} value={i + 1} style={{ background: "#0d0e20" }}>
              {i + 1}日
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={!month || !day}
        className="px-6 py-3 text-sm tracking-widest uppercase transition-all duration-300 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, rgba(212,168,76,0.18), rgba(212,168,76,0.08))",
          border: "1px solid rgba(212,168,76,0.5)",
          color: "#e8d08a",
        }}
      >
        見る →
      </button>
    </form>
  );
}
