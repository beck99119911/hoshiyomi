"use client";
import { useState, useRef, useCallback } from "react";

type MouthState = "closed" | "half" | "open";

function Character({ mouth }: { mouth: MouthState }) {
  return (
    <svg viewBox="0 0 120 155" width="200" height="258" className="mx-auto drop-shadow-lg">
      <defs>
        <radialGradient id="faceGlow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="rgba(120,80,200,0.18)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="irisL" cx="35%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#a070e0" />
          <stop offset="100%" stopColor="#4020a0" />
        </radialGradient>
        <radialGradient id="irisR" cx="35%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#a070e0" />
          <stop offset="100%" stopColor="#4020a0" />
        </radialGradient>
      </defs>

      {/* Ambient glow */}
      <ellipse cx="60" cy="85" rx="56" ry="64" fill="url(#faceGlow)" />

      {/* Hair back */}
      <ellipse cx="60" cy="44" rx="43" ry="36" fill="#08050f" />
      {/* Side hair strands */}
      <path d="M 19 72 Q 10 100 16 128" stroke="#08050f" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M 101 72 Q 110 100 104 128" stroke="#08050f" strokeWidth="11" fill="none" strokeLinecap="round" />

      {/* Face */}
      <ellipse cx="60" cy="96" rx="37" ry="47" fill="#1a1030" stroke="rgba(212,168,76,0.3)" strokeWidth="0.8" />

      {/* Hair front (bangs) */}
      <ellipse cx="60" cy="51" rx="40" ry="22" fill="#08050f" />
      <path d="M 26 63 Q 32 75 38 70" stroke="#08050f" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M 94 63 Q 88 75 82 70" stroke="#08050f" strokeWidth="7" fill="none" strokeLinecap="round" />

      {/* Eyebrows */}
      <path d="M 34 74 Q 42 70 49 73" stroke="rgba(212,168,76,0.7)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M 71 73 Q 78 70 86 74" stroke="rgba(212,168,76,0.7)" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Left eye */}
      <ellipse cx="42" cy="83" rx="9" ry="8" fill="#ede8f8" />
      <ellipse cx="42" cy="84" rx="6" ry="6.5" fill="url(#irisL)" />
      <ellipse cx="42" cy="84" rx="3.5" ry="4" fill="#060410" />
      <ellipse cx="44" cy="82" rx="1.5" ry="1.5" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="40" cy="85" rx="0.8" ry="0.8" fill="rgba(255,255,255,0.4)" />

      {/* Right eye */}
      <ellipse cx="78" cy="83" rx="9" ry="8" fill="#ede8f8" />
      <ellipse cx="78" cy="84" rx="6" ry="6.5" fill="url(#irisR)" />
      <ellipse cx="78" cy="84" rx="3.5" ry="4" fill="#060410" />
      <ellipse cx="80" cy="82" rx="1.5" ry="1.5" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="76" cy="85" rx="0.8" ry="0.8" fill="rgba(255,255,255,0.4)" />

      {/* Nose */}
      <path d="M 57 99 Q 60 103 63 99" stroke="rgba(212,168,76,0.2)" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Mouth */}
      {mouth === "closed" && (
        <path d="M 48 115 Q 60 121 72 115" stroke="#c9a84c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
      {mouth === "half" && (
        <ellipse cx="60" cy="116" rx="9" ry="5" fill="#060410" stroke="#c9a84c" strokeWidth="0.8" />
      )}
      {mouth === "open" && (
        <ellipse cx="60" cy="116" rx="12" ry="9" fill="#060410" stroke="#c9a84c" strokeWidth="0.8" />
      )}

      {/* Ear decorations */}
      <circle cx="23" cy="96" r="2.5" fill="none" stroke="rgba(212,168,76,0.45)" strokeWidth="0.8" />
      <circle cx="97" cy="96" r="2.5" fill="none" stroke="rgba(212,168,76,0.45)" strokeWidth="0.8" />
      <circle cx="23" cy="96" r="1" fill="rgba(212,168,76,0.3)" />
      <circle cx="97" cy="96" r="1" fill="rgba(212,168,76,0.3)" />
    </svg>
  );
}

export default function VoiceTestPage() {
  const [text, setText] = useState(
    "木星があなたの第5ハウスに輝いています。今週は創造性が高まり、新しい表現の扉が開きます。あなたの直感を信じてください。星があなたを導いています。"
  );
  const [voice, setVoice] = useState("ja-JP-Neural2-B");
  const [pitch, setPitch] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mouth, setMouth] = useState<MouthState>("closed");
  const animFrameRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const speak = useCallback(async () => {
    if (isSpeaking || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, pitch }),
      });
      if (!res.ok) throw new Error("TTS failed");

      const arrayBuffer = await res.arrayBuffer();
      setIsLoading(false);
      setIsSpeaking(true);

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const source = audioCtx.createBufferSource();
      sourceRef.current = source;
      source.buffer = audioBuffer;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      const timeData = new Uint8Array(analyser.fftSize);
      const animate = () => {
        analyser.getByteTimeDomainData(timeData);
        let sum = 0;
        for (const v of timeData) {
          const n = (v - 128) / 128;
          sum += n * n;
        }
        const rms = Math.sqrt(sum / timeData.length);
        if (rms > 0.08) setMouth("open");
        else if (rms > 0.02) setMouth("half");
        else setMouth("closed");
        animFrameRef.current = requestAnimationFrame(animate);
      };

      source.start();
      animate();

      source.onended = () => {
        cancelAnimationFrame(animFrameRef.current);
        setMouth("closed");
        setIsSpeaking(false);
        audioCtx.close();
      };
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      setIsSpeaking(false);
      setMouth("closed");
    }
  }, [text, voice, pitch, isSpeaking, isLoading]);

  const stop = useCallback(() => {
    sourceRef.current?.stop();
    cancelAnimationFrame(animFrameRef.current);
    audioCtxRef.current?.close();
    setMouth("closed");
    setIsSpeaking(false);
  }, []);

  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16 text-[#f0e8d8]">
      <p className="text-[10px] tracking-[0.4em] text-[#c9a84c]/40 mb-10 uppercase">
        Voice Test · Dev Only
      </p>

      {/* Character */}
      <div className="mb-8 relative">
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(120,80,200,0.15) 0%, transparent 70%)" }}
        />
        <Character mouth={mouth} />
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm space-y-4">

        {/* 声の選択 */}
        <div className="space-y-2">
          <p className="text-[9px] tracking-widest text-[#c9a84c]/50 uppercase">Voice</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: "ja-JP-Neural2-B", label: "女性A（若め）" },
              { id: "ja-JP-Neural2-A", label: "女性B（落ち着き）" },
              { id: "ja-JP-Neural2-D", label: "男性A（低め）" },
              { id: "ja-JP-Neural2-C", label: "男性B（柔らか）" },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setVoice(v.id)}
                className={`py-2 px-3 border text-left transition-all ${
                  voice === v.id
                    ? "border-[#c9a84c]/70 text-[#c9a84c]"
                    : "border-[#c9a84c]/20 text-[#f0e8d8]/40 hover:border-[#c9a84c]/40"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* ピッチ調整 */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] tracking-widest text-[#c9a84c]/50 uppercase">
            <span>Pitch</span>
            <span>{pitch > 0 ? `+${pitch}` : pitch}</span>
          </div>
          <input
            type="range" min={-6} max={6} step={1} value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            className="w-full accent-[#c9a84c]"
          />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full bg-transparent border border-[#c9a84c]/25 p-3 text-sm text-[#f0e8d8]/70 resize-none focus:outline-none focus:border-[#c9a84c]/50 leading-relaxed"
          placeholder="読み上げるテキストを入力..."
        />
        <div className="flex gap-3">
          <button
            onClick={speak}
            disabled={isSpeaking || isLoading}
            className="flex-1 py-3 text-sm tracking-widest uppercase border border-[#c9a84c]/45 text-[#c9a84c] disabled:opacity-35 hover:bg-[#c9a84c]/5 transition-all"
          >
            {isLoading ? "生成中..." : isSpeaking ? "読み上げ中..." : "▶ 読み上げ"}
          </button>
          {(isSpeaking || isLoading) && (
            <button
              onClick={stop}
              className="px-5 py-3 text-sm border border-[#c9a84c]/25 text-[#f0e8d8]/40 hover:text-[#f0e8d8]/70 transition-colors"
            >
              ■
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
