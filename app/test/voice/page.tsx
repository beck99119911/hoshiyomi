"use client";
import { useState, useRef, useCallback } from "react";

type MouthState = "closed" | "half" | "open";

const FACE_SRC: Record<MouthState, string> = {
  closed: "/character/face_closed.png",
  half:   "/character/face_half.png",
  open:   "/character/face_open.png",
};

function Character({ mouth }: { mouth: MouthState }) {
  return (
    <div className="relative mx-auto" style={{ width: 300, height: 340 }}>
      {/* Glow */}
      <div
        className="absolute inset-0 blur-3xl opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 40%, #7850c8, transparent 70%)" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FACE_SRC[mouth]}
        alt="占い師"
        className="w-full h-full object-cover"
        style={{ objectPosition: "50% 15%" }}
      />
    </div>
  );
}

export default function VoiceTestPage() {
  const [text, setText] = useState(
    "木星があなたの第5ハウスに輝いています。今週は創造性が高まり、新しい表現の扉が開きます。あなたの直感を信じてください。星があなたを導いています。"
  );
  const [voice, setVoice] = useState("ja-JP-Neural2-D");
  const [pitch, setPitch] = useState(-4);
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

      {/* キャラクター */}
      <div className="mb-8">
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
