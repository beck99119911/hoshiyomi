"use client";

import Link from "next/link";
import { useState } from "react";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubscribe() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/komoju/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("決済ページの取得に失敗しました。再度お試しください。");
      }
    } catch {
      setError("エラーが発生しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative z-10 min-h-screen text-[#f0e8d8] px-6 py-12">
      <div className="max-w-md mx-auto">

        <div className="flex items-center justify-between mb-12">
          <Link
            href="/fortune"
            className="text-xs tracking-[0.3em] text-[#d4a84c]/60 hover:text-[#d4a84c] transition-colors uppercase"
          >
            ← Fortune
          </Link>
        </div>

        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase mb-3">Premium Plan</p>
          <h1 className="text-3xl font-bold"><span className="gold-text">プレミアムに登録</span></h1>
          <p className="text-xs text-[#f0e8d8]/30 tracking-wider mt-2">月額 ¥980（税込）· いつでも解約可能</p>
        </div>

        {/* プラン内容 */}
        <div
          className="mb-8 p-6 space-y-3"
          style={{ background: "rgba(212,168,76,0.04)", border: "1px solid rgba(212,168,76,0.2)" }}
        >
          {[
            "運勢・手相を1日何度でも（無制限）",
            "鑑定メッセージ全文を音声で聴ける",
            "相性診断の全結果表示",
            "相性診断のAIアドバイス全表示",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm text-[#f5eedd]/70">
              <span className="text-[#d4a84c]">✦</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* 決済ボタン */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-4 text-sm tracking-[0.2em] font-medium transition-opacity disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #d4a84c, #b8863a)", color: "#1a1025" }}
        >
          {loading ? "処理中..." : "プレミアムに登録する"}
        </button>

        {error && (
          <p className="text-center text-xs text-red-400 mt-4">{error}</p>
        )}

        <p className="text-center text-[10px] text-[#f0e8d8]/20 tracking-wider leading-relaxed mt-6">
          Visa・Mastercard に対応しています。<br />
          解約はいつでもメールにてご連絡ください。
        </p>
      </div>
    </main>
  );
}
