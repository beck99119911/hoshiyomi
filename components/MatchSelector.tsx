"use client";

import { useState } from "react";
import Link from "next/link";

const ZODIACS = [
  { slug: "aries",       name: "牡羊座", symbol: "♈" },
  { slug: "taurus",      name: "牡牛座", symbol: "♉" },
  { slug: "gemini",      name: "双子座", symbol: "♊" },
  { slug: "cancer",      name: "蟹座",   symbol: "♋" },
  { slug: "leo",         name: "獅子座", symbol: "♌" },
  { slug: "virgo",       name: "乙女座", symbol: "♍" },
  { slug: "libra",       name: "天秤座", symbol: "♎" },
  { slug: "scorpio",     name: "蠍座",   symbol: "♏" },
  { slug: "sagittarius", name: "射手座", symbol: "♐" },
  { slug: "capricorn",   name: "山羊座", symbol: "♑" },
  { slug: "aquarius",    name: "水瓶座", symbol: "♒" },
  { slug: "pisces",      name: "魚座",   symbol: "♓" },
];

export default function MatchSelector() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedSign = ZODIACS.find((z) => z.slug === selected);

  return (
    <div>
      <p className="text-xs text-[#f5eedd]/50 tracking-wider text-center mb-5">
        あなたの星座を選んでください
      </p>

      {/* 星座グリッド（選択） */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {ZODIACS.map((z) => (
          <button
            key={z.slug}
            onClick={() => setSelected(selected === z.slug ? null : z.slug)}
            className="py-3 text-center transition-all duration-200"
            style={{
              background: selected === z.slug
                ? "rgba(212,168,76,0.18)"
                : "rgba(212,168,76,0.04)",
              border: selected === z.slug
                ? "1px solid rgba(212,168,76,0.6)"
                : "1px solid rgba(212,168,76,0.12)",
              color: selected === z.slug ? "#e8d08a" : "#f5eedd99",
            }}
          >
            <div className="text-base leading-none">{z.symbol}</div>
            <div className="text-[9px] tracking-wide mt-1">{z.name}</div>
          </button>
        ))}
      </div>

      {/* 相手の星座リスト */}
      {selected && selectedSign && (
        <div>
          <p className="text-[10px] tracking-[0.3em] text-[#d4a84c]/50 uppercase text-center mb-4">
            {selectedSign.name} との相性
          </p>
          <div className="grid grid-cols-4 gap-2">
            {ZODIACS.map((z) => (
              <Link
                key={z.slug}
                href={`/match/${selected}-${z.slug}`}
                className="py-3 text-center transition-all duration-200 hover:opacity-80"
                style={{
                  background: z.slug === selected
                    ? "rgba(212,168,76,0.10)"
                    : "rgba(212,168,76,0.04)",
                  border: "1px solid rgba(212,168,76,0.15)",
                  color: "#f5eedd99",
                }}
              >
                <div className="text-base leading-none">{z.symbol}</div>
                <div className="text-[9px] tracking-wide mt-1">{z.name}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
