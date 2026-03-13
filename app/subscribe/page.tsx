"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

declare global {
  interface Window {
    Payjp: (key: string) => {
      elements: () => {
        create: (type: string, options?: object) => {
          mount: (selector: string) => void;
          unmount: () => void;
        };
      };
      createToken: (element: unknown) => Promise<{
        token?: { id: string };
        error?: { message: string };
      }>;
    };
  }
}

export default function SubscribePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  type CardElement = { mount: (selector: string) => void; unmount: () => void };
  const payjpRef = useRef<ReturnType<typeof window.Payjp> | null>(null);
  const cardElementRef = useRef<CardElement | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/fortune");
    }
  }, [status, router]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.pay.jp/v2/pay.js";
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !window.Payjp) return;

    const payjp = window.Payjp(process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY!);
    payjpRef.current = payjp;

    const elements = payjp.elements();
    const cardElement = elements.create("card", {
      style: {
        base: {
          color: "#f0e8d8",
          "::placeholder": { color: "rgba(240,232,216,0.3)" },
        },
      },
    });
    cardElement.mount("#card-element");
    cardElementRef.current = cardElement;
  }, [scriptLoaded]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!payjpRef.current || !cardElementRef.current) return;

    setError("");
    setLoading(true);

    try {
      const result = await payjpRef.current.createToken(cardElementRef.current);
      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      const tokenId = (result as unknown as { id: string }).id ?? result.token?.id;
      if (!tokenId) {
        setError("カードのトークン取得に失敗しました");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/payjp/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // キャッシュをクリア
      const uid = session?.user?.id;
      if (uid) localStorage.setItem(`premium_${uid}`, "1");

      router.push("/fortune?upgraded=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setLoading(false);
    }
  }

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return (
      <main className="relative z-10 min-h-screen text-[#f0e8d8] flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-sm">
          <p className="text-[10px] tracking-[0.4em] text-[#d4a84c]/60 uppercase">Premium Plan</p>
          <h1 className="text-2xl font-bold"><span className="gold-text">ログインが必要です</span></h1>
          <p className="text-sm text-[#f0e8d8]/50 leading-relaxed">プレミアムに登録するにはログインしてください</p>
          <button
            onClick={() => signIn("google", { callbackUrl: "/subscribe" })}
            className="w-full py-3 text-sm tracking-widest uppercase transition-all hover:opacity-80"
            style={{ background: "linear-gradient(135deg, rgba(212,168,76,0.18), rgba(212,168,76,0.08))", border: "1px solid rgba(212,168,76,0.5)", color: "#e8d08a" }}
          >
            Googleでログイン →
          </button>
          <Link href="/fortune" className="block text-xs text-[#f0e8d8]/30 hover:text-[#f0e8d8]/50 tracking-wider">
            ← 戻る
          </Link>
        </div>
      </main>
    );
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

        {/* 決済準備中 */}
        <div
          className="py-10 text-center space-y-4"
          style={{ border: "1px solid rgba(212,168,76,0.2)", background: "rgba(212,168,76,0.03)" }}
        >
          <p className="text-2xl">🔧</p>
          <p className="text-sm tracking-widest text-[#d4a84c]/80">決済機能 準備中</p>
          <p className="text-xs text-[#f0e8d8]/40 leading-relaxed">
            現在、決済システムの導入手続きを進めています。<br />
            準備が整い次第、ご利用いただけます。
          </p>
        </div>

        <p className="text-center text-[10px] text-[#f0e8d8]/20 tracking-wider leading-relaxed mt-6">
          もうしばらくお待ちください。
        </p>
      </div>
    </main>
  );
}
