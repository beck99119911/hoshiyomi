"use client";

import Link from "next/link";

export default function TodayBirthdayLink() {
  const jst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const m = jst.getMonth() + 1;
  const d = jst.getDate();
  const mmdd = `${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;

  return (
    <div className="mt-6 text-center">
      <Link
        href={`/birthday/${mmdd}`}
        className="inline-flex items-center gap-2 text-xs tracking-wider transition-all hover:opacity-80"
        style={{ color: "#d4a84c", border: "1px solid rgba(212,168,76,0.3)", padding: "8px 20px" }}
      >
        <span className="text-[#d4a84c]/60">✦</span>
        今日（{m}月{d}日）が誕生日の方はこちら
        <span>→</span>
      </Link>
    </div>
  );
}
