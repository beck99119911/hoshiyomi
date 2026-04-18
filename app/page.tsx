import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import BirthdaySearch from "@/components/BirthdaySearch";
import MatchSelector from "@/components/MatchSelector";
import TodayBirthdayLink from "@/components/TodayBirthdayLink";
import SampleReadingToggle from "@/components/SampleReadingToggle";

const GOLD = '#c8944a';
const GOLD_BRIGHT = '#e8c078';
const INK_SOFT = '#f3e9d2';
const INK_MUTED = '#a89878';

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

function generateStars(density: number, seed: number) {
  let s = seed * 9301 + 49297;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  return Array.from({ length: density }, () => {
    const size = rand() < 0.85 ? rand() * 1.2 + 0.4 : rand() * 1.5 + 1.6;
    return { x: rand() * 100, y: rand() * 100, size, op: 0.2 + rand() * 0.8, tw: rand() * 4, dur: 3 + rand() * 5 };
  });
}

function Starfield({ density = 60, seed = 1, opacity = 0.9 }: { density?: number; seed?: number; opacity?: number }) {
  const stars = generateStars(density, seed);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity }}>
      {stars.map((st, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${st.x}%`, top: `${st.y}%`,
          width: `${st.size}px`, height: `${st.size}px`,
          borderRadius: '50%',
          background: st.size > 1.4 ? GOLD_BRIGHT : '#fff',
          opacity: st.op,
          boxShadow: st.size > 1.4 ? `0 0 ${st.size * 3}px ${GOLD}` : `0 0 ${st.size * 2}px rgba(255,255,255,0.6)`,
          animation: `twinkle ${st.dur.toFixed(1)}s ease-in-out ${st.tw.toFixed(1)}s infinite`,
        }} />
      ))}
    </div>
  );
}

function Eyebrow({ en, ja }: { en: string; ja?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 14 }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 13, letterSpacing: '0.3em', color: GOLD }}>{en}</div>
      <div style={{ width: 24, height: 1, background: GOLD }} />
      {ja && <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 10, letterSpacing: '0.4em', color: INK_MUTED, fontWeight: 500 }}>{ja}</div>}
    </div>
  );
}

function GoldDivider({ glyph = '✦', compact = false }: { glyph?: string; compact?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: compact ? '20px 24px' : '36px 24px' }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GOLD}88, ${GOLD})` }} />
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: `0.5px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD_BRIGHT, fontSize: 14, background: `radial-gradient(circle, rgba(200,148,74,0.15), transparent 70%)` }}>{glyph}</div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GOLD}88, ${GOLD})` }} />
    </div>
  );
}

function GradientCard({ children, hue = 0 }: { children: React.ReactNode; hue?: number }) {
  const border = hue === 1
    ? `linear-gradient(160deg, ${GOLD_BRIGHT}, ${GOLD}33, #6a4ba8, ${GOLD})`
    : hue === 2
    ? `linear-gradient(160deg, #9a7ad6, ${GOLD}, #5b2e9a, ${GOLD_BRIGHT})`
    : `linear-gradient(160deg, ${GOLD_BRIGHT}, ${GOLD}22, ${GOLD_BRIGHT}, ${GOLD})`;
  return (
    <div style={{ position: 'relative', borderRadius: 4, padding: 1, background: border, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
      <div style={{ background: 'linear-gradient(180deg, #0a0c1e 0%, #0d0a20 100%)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function HeroSection() {
  const d = new Date();
  const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

  return (
    <section style={{
      position: 'relative',
      background: `radial-gradient(ellipse at 50% 0%, rgba(138,82,198,0.22), transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(200,148,74,0.08), transparent 55%), linear-gradient(180deg, #08061a 0%, #050814 55%, #050814 100%)`,
      padding: '0 24px 48px',
      overflow: 'hidden',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <Starfield density={80} seed={3} />

      {/* Moon */}
      <div style={{ position: 'absolute', top: 80, right: 0, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle at 40% 38%, #fff8e8 0%, ${GOLD_BRIGHT} 35%, ${GOLD} 60%, #5a3e18 100%)`, boxShadow: `0 0 80px rgba(200,148,74,0.35), inset -20px -20px 40px rgba(0,0,0,0.4)`, opacity: 0.88 }}>
        <div style={{ position:'absolute', top:34, left:46, width:14, height:14, borderRadius:'50%', background:'rgba(0,0,0,0.12)' }} />
        <div style={{ position:'absolute', top:68, left:80, width:9, height:9, borderRadius:'50%', background:'rgba(0,0,0,0.10)' }} />
        <div style={{ position:'absolute', top:102, left:57, width:18, height:18, borderRadius:'50%', background:'rgba(0,0,0,0.12)' }} />
      </div>

      {/* Auth */}
      <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <AuthButton />
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 480, margin: '0 auto', width: '100%', paddingTop: 88 }}>
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 42 }}>
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M12 1 L14 9 L22 10 L16 14.5 L18 22 L12 17.5 L6 22 L8 14.5 L2 10 L10 9 Z" fill={GOLD_BRIGHT} stroke={GOLD} strokeWidth="0.5" />
          </svg>
          <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 16, letterSpacing: '0.3em', color: INK_SOFT, fontWeight: 600 }}>星詠み</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 11, color: GOLD, letterSpacing: '0.15em', marginTop: 2 }}>Hoshi-yomi</div>
        </div>

        {/* Eyebrow badge */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 14px', border: `0.5px solid ${GOLD}66`, borderRadius: 2, background: 'linear-gradient(90deg, rgba(200,148,74,0.08), rgba(200,148,74,0.02))' }}>
            <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: GOLD_BRIGHT, boxShadow: `0 0 6px ${GOLD}` }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.25em', color: GOLD, fontWeight: 500 }}>
              TONIGHT&apos;S ORACLE · {dateStr}
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ margin: '0 0 22px', fontFamily: "'Noto Serif JP', serif", fontWeight: 500, fontSize: 40, lineHeight: 1.35, letterSpacing: '0.02em', color: INK_SOFT }}>
          <div>あなたの運命は、</div>
          <div style={{ background: `linear-gradient(180deg, ${GOLD_BRIGHT} 0%, ${GOLD} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700, filter: `drop-shadow(0 0 14px rgba(200,148,74,0.35))` } as React.CSSProperties}>星が知っている。</div>
        </h1>

        <p style={{ margin: '0 0 28px', color: INK_SOFT, fontSize: 14, lineHeight: 1.9, fontWeight: 300, letterSpacing: '0.04em', maxWidth: 330, opacity: 0.82 }}>
          生年月日から導く、あなただけの宇宙の設計図
        </p>

        {/* CTA button */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/fortune" style={{
            display: 'block', width: '100%', padding: '18px 28px', borderRadius: 2,
            background: `linear-gradient(180deg, ${GOLD_BRIGHT} 0%, ${GOLD} 48%, #a87b3a 100%)`,
            color: '#1a1205', fontFamily: "'Noto Serif JP', serif", fontWeight: 700, fontSize: 16,
            letterSpacing: '0.15em', textAlign: 'center', textDecoration: 'none',
            boxShadow: `0 0 0 1px ${GOLD_BRIGHT}55, 0 4px 18px ${GOLD}55, 0 0 28px ${GOLD}66`,
            position: 'relative', overflow: 'hidden',
          }}>
            <span style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span>無料で鑑定を始める</span>
              <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.3em', opacity: 0.75 }}>FREE · 3 MIN</span>
            </span>
          </Link>
        </div>

        {/* Social proof */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: `0.5px solid ${GOLD}33`, borderBottom: `0.5px solid ${GOLD}33` }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 20 }}>
            {['完全無料', '登録不要', '3分で完了'].map((label) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: INK_MUTED, letterSpacing: '0.1em' }}>
                <span style={{ color: GOLD_BRIGHT }}>✓</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 0 8px' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.4em', color: INK_MUTED }}>READ THE STARS</div>
          <div style={{ width: 1, height: 36, background: `linear-gradient(to bottom, ${GOLD}, transparent)`, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: '-2px', width: 5, height: 5, borderRadius: '50%', background: GOLD_BRIGHT, boxShadow: `0 0 8px ${GOLD}`, animation: 'scrollDot 2.2s ease-in-out infinite' }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      no: 'I', en: 'ASTROLOGY', ja: '西洋占星術', title: '生まれた瞬間の空',
      desc: '太陽・月・惑星の配置から、あなたの性格・才能・運命の流れを読み解きます。ホロスコープで、本質のあなたに出逢う。',
      tags: ['12星座', '10惑星', 'ハウス'],
    },
    {
      no: 'II', en: 'NUMEROLOGY', ja: '数秘術', title: '数に宿る、魂の設計図',
      desc: '生年月日から導く運命数が、あなたの使命と人生のテーマを明かす。古代から受け継がれる数の叡智。',
      tags: ['運命数', 'ソウルナンバー', 'ライフパス'],
    },
    {
      no: 'III', en: 'BLOOD TYPE', ja: '血液型', title: '流れる血の、静かな声',
      desc: '血液型に現れる気質の傾向を、星と数の鑑定に重ねる。三つの視点が交差する、唯一無二の鑑定結果へ。',
      tags: ['A · B · O · AB', '相性診断', '恋愛傾向'],
    },
  ];

  const glyphs = [
    <svg key="a" viewBox="0 0 60 60" width="52" height="52">
      <circle cx="30" cy="30" r="26" fill="none" stroke={GOLD_BRIGHT} strokeWidth="0.6" />
      <circle cx="30" cy="30" r="18" fill="none" stroke={GOLD_BRIGHT} strokeWidth="0.4" opacity="0.6" />
      {Array.from({length:12}).map((_,i) => {
        const a = (i * 30 - 90) * Math.PI / 180;
        return <line key={i} x1={30 + 18*Math.cos(a)} y1={30 + 18*Math.sin(a)} x2={30 + 26*Math.cos(a)} y2={30 + 26*Math.sin(a)} stroke={GOLD_BRIGHT} strokeWidth="0.4" opacity="0.6"/>;
      })}
      <circle cx="30" cy="30" r="3" fill={GOLD_BRIGHT} />
      <circle cx="44" cy="22" r="1.5" fill={GOLD_BRIGHT} />
      <circle cx="16" cy="38" r="1.2" fill={GOLD_BRIGHT} />
    </svg>,
    <svg key="n" viewBox="0 0 60 60" width="52" height="52">
      <polygon points="30,6 54,45 6,45" fill="none" stroke={GOLD_BRIGHT} strokeWidth="0.6"/>
      <polygon points="30,16 46,40 14,40" fill="none" stroke={GOLD_BRIGHT} strokeWidth="0.4" opacity="0.6"/>
      <text x="30" y="36" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="16" fill={GOLD_BRIGHT} fontStyle="italic">7</text>
      <circle cx="30" cy="6" r="1.5" fill={GOLD_BRIGHT} />
      <circle cx="54" cy="45" r="1.5" fill={GOLD_BRIGHT} />
      <circle cx="6" cy="45" r="1.5" fill={GOLD_BRIGHT} />
    </svg>,
    <svg key="b" viewBox="0 0 60 60" width="52" height="52">
      <path d="M30 8 C38 22 46 32 46 42 A16 16 0 0 1 14 42 C14 32 22 22 30 8 Z" fill="none" stroke={GOLD_BRIGHT} strokeWidth="0.6"/>
      <path d="M30 18 C35 27 40 34 40 41 A10 10 0 0 1 20 41 C20 34 25 27 30 18 Z" fill={GOLD_BRIGHT} opacity="0.12"/>
      <circle cx="34" cy="38" r="3" fill={GOLD_BRIGHT} opacity="0.6" />
      <circle cx="26" cy="45" r="1.5" fill={GOLD_BRIGHT} opacity="0.8" />
    </svg>,
  ];

  return (
    <section style={{ position: 'relative', padding: '56px 24px', background: 'linear-gradient(180deg, #050814 0%, #08081a 100%)', overflow: 'hidden' }}>
      <Starfield density={30} seed={7} opacity={0.5} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 480, margin: '0 auto' }}>
        <Eyebrow en="THE THREE ORACLES" ja="三つの叡智" />
        <h2 style={{ margin: '0 0 10px', textAlign: 'center', fontFamily: "'Noto Serif JP', serif", fontWeight: 500, fontSize: 24, lineHeight: 1.5, color: INK_SOFT }}>
          <span style={{ color: GOLD_BRIGHT }}>三</span>つの視点が重なる時、<br />
          運命の輪郭が立ち現れる。
        </h2>
        <p style={{ textAlign: 'center', margin: '0 0 32px', color: INK_MUTED, fontSize: 12, lineHeight: 2, letterSpacing: '0.1em' }}>
          古代の占星術、数の神秘、血の気質。<br />
          三つの鑑定が織り成す、あなただけの物語。
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {features.map((f, i) => (
            <GradientCard key={i} hue={i === 1 ? 1 : (i === 2 ? 2 : 0)}>
              <div style={{ display: 'flex', gap: 14, padding: '22px 20px', position: 'relative' }}>
                <div style={{ width: 72, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: `radial-gradient(circle, rgba(200,148,74,0.15), transparent 70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `0.5px solid ${GOLD}44` }}>
                    {glyphs[i]}
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 18, color: GOLD_BRIGHT, letterSpacing: '0.1em' }}>{f.no}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.3em', color: GOLD, marginBottom: 4 }}>{f.en}</div>
                  <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', color: INK_MUTED, marginBottom: 8 }}>{f.ja}</div>
                  <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 17, fontWeight: 500, lineHeight: 1.5, color: INK_SOFT, marginBottom: 10 }}>{f.title}</div>
                  <p style={{ margin: '0 0 14px', fontSize: 12, lineHeight: 1.85, color: INK_MUTED, fontWeight: 300 }}>{f.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {f.tags.map((t, ti) => (
                      <span key={ti} style={{ fontSize: 9.5, padding: '4px 8px', border: `0.5px solid ${GOLD}55`, color: INK_SOFT, letterSpacing: '0.08em' }}>{t}</span>
                    ))}
                  </div>
                </div>
                {[0,1,2,3].map(k => (
                  <div key={k} style={{ position: 'absolute', top: k < 2 ? 6 : 'auto', bottom: k >= 2 ? 6 : 'auto', left: k % 2 === 0 ? 6 : 'auto', right: k % 2 === 1 ? 6 : 'auto', width: 6, height: 6, borderTop: k < 2 ? `0.5px solid ${GOLD}` : 'none', borderBottom: k >= 2 ? `0.5px solid ${GOLD}` : 'none', borderLeft: k % 2 === 0 ? `0.5px solid ${GOLD}` : 'none', borderRight: k % 2 === 1 ? `0.5px solid ${GOLD}` : 'none' }} />
                ))}
              </div>
            </GradientCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function TransitionBand({ phase }: { phase: 1 | 2 | 3 }) {
  if (phase === 1) return (
    <div style={{ position: 'relative', height: 120, overflow: 'hidden', background: 'linear-gradient(180deg, #050814, #050814)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 13, color: GOLD, letterSpacing: '0.3em' }}>— you are guided —</div>
      <GoldDivider glyph="☾" compact />
    </div>
  );
  if (phase === 2) return (
    <div style={{ position: 'relative', height: 120, overflow: 'hidden', background: 'linear-gradient(180deg, #08081a, #0a0820)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 100 100" width="56" height="56" style={{ opacity: 0.8 }}>
        <circle cx="50" cy="50" r="28" fill="none" stroke={GOLD} strokeWidth="0.4"/>
        <circle cx="50" cy="50" r="20" fill="none" stroke={GOLD} strokeWidth="0.4" opacity="0.6"/>
        {Array.from({length:8}).map((_,i)=>{
          const a = (i*45)*Math.PI/180;
          return <line key={i} x1="50" y1="50" x2={50+28*Math.cos(a)} y2={50+28*Math.sin(a)} stroke={GOLD} strokeWidth="0.3"/>
        })}
        <circle cx="50" cy="50" r="3" fill={GOLD_BRIGHT}/>
      </svg>
      <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 10, color: INK_MUTED, letterSpacing: '0.5em', marginTop: 8 }}>さあ、覗いてみましょう</div>
    </div>
  );
  return (
    <div style={{ position: 'relative', height: 80, overflow: 'hidden', background: 'linear-gradient(180deg, #070618, #050814)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <GoldDivider glyph="✧" />
    </div>
  );
}

function FinalCTASection() {
  return (
    <section style={{ position: 'relative', padding: '52px 24px 56px', background: `radial-gradient(ellipse at 50% 40%, rgba(138,82,198,0.25), transparent 60%), linear-gradient(180deg, #050814, #08061a)`, overflow: 'hidden' }}>
      <Starfield density={60} seed={33} />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 13, color: GOLD, letterSpacing: '0.3em', marginBottom: 14 }}>READ YOUR STARS TONIGHT</div>
        <h2 style={{ margin: '0 0 14px', fontFamily: "'Noto Serif JP', serif", fontWeight: 500, fontSize: 26, lineHeight: 1.55, color: INK_SOFT }}>
          星は、いつも<br />
          <span style={{ background: `linear-gradient(180deg, ${GOLD_BRIGHT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 } as React.CSSProperties}>あなたを待っている。</span>
        </h2>
        <p style={{ margin: '0 0 26px', color: INK_MUTED, fontSize: 12, lineHeight: 2, letterSpacing: '0.08em' }}>
          生年月日と、少しの勇気だけ。<br />
          3分であなたの物語が動き始めます。
        </p>
        <Link href="/fortune" style={{ display: 'block', width: '100%', padding: '18px 28px', borderRadius: 2, background: `linear-gradient(180deg, ${GOLD_BRIGHT} 0%, ${GOLD} 48%, #a87b3a 100%)`, color: '#1a1205', fontFamily: "'Noto Serif JP', serif", fontWeight: 700, fontSize: 16, letterSpacing: '0.15em', textAlign: 'center', textDecoration: 'none', boxShadow: `0 0 0 1px ${GOLD_BRIGHT}55, 0 4px 18px ${GOLD}55, 0 0 28px ${GOLD}66` }}>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span>無料で鑑定を始める</span>
            <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.3em', opacity: 0.75 }}>FREE · 3 MIN</span>
          </span>
        </Link>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: 10, color: INK_MUTED, letterSpacing: '0.1em' }}>
          <span>✓ 完全無料</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>✓ 登録不要</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>✓ 3分で完了</span>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <style>{`
        @keyframes barFill { from { width: 0%; } }
        .bar-anim { animation: barFill 1.2s ease forwards; }
      `}</style>
      <main className="relative z-10 min-h-screen" style={{ color: INK_SOFT }}>

        <HeroSection />
        <TransitionBand phase={1} />
        <FeaturesSection />
        <TransitionBand phase={2} />
        <SampleReadingToggle />
        <TransitionBand phase={3} />
        <FinalCTASection />

        {/* ── 既存機能セクション ── */}
        <div style={{ background: 'linear-gradient(180deg, #050814, #08081a)' }}>
          <section className="px-6 py-20 max-w-xl mx-auto">

            {/* Birthday */}
            <div style={{ marginBottom: 80 }}>
              <Eyebrow en="BIRTHDAY READING" ja="誕生日占い" />
              <p style={{ textAlign: 'center', marginBottom: 24, color: INK_MUTED, fontSize: 12, lineHeight: 1.9, letterSpacing: '0.08em' }}>
                365日すべての誕生日の運命・性格・2026年の運勢を掲載。
              </p>
              <BirthdaySearch />
              <TodayBirthdayLink />
            </div>

            {/* Zodiac */}
            <div style={{ marginBottom: 80 }}>
              <Eyebrow en="ZODIAC READING" ja="星座占い" />
              <p style={{ textAlign: 'center', marginBottom: 24, color: INK_MUTED, fontSize: 12, lineHeight: 1.9, letterSpacing: '0.08em' }}>
                12星座それぞれの性格・恋愛・仕事・2026年運勢を詳しく解説。
              </p>
              <div className="grid grid-cols-4 gap-2">
                {ZODIACS.map((z) => (
                  <Link key={z.slug} href={`/zodiac/${z.slug}`} style={{ padding: '16px 0', textAlign: 'center', background: 'rgba(200,148,74,0.04)', border: `1px solid rgba(200,148,74,0.12)`, color: `${INK_SOFT}99`, textDecoration: 'none', transition: 'opacity 0.2s' }}>
                    <div style={{ fontSize: 18, lineHeight: 1, background: `linear-gradient(135deg, #b8902e, ${GOLD_BRIGHT}, ${GOLD}, ${GOLD_BRIGHT}, #b8902e)`, backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } as React.CSSProperties}>{z.symbol}</div>
                    <div style={{ fontSize: 9, letterSpacing: '0.05em', marginTop: 6, color: INK_MUTED }}>{z.name}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Compatibility */}
            <div style={{ marginBottom: 80 }}>
              <Eyebrow en="COMPATIBILITY" ja="相性占い" />
              <p style={{ textAlign: 'center', marginBottom: 24, color: INK_MUTED, fontSize: 12, lineHeight: 1.9, letterSpacing: '0.08em' }}>
                144通りの星座相性をスコアで表示。<br />
                相手との恋愛・友情・仕事の相性を確認できます。
              </p>
              <MatchSelector />
            </div>

          </section>
        </div>

        {/* Footer */}
        <footer style={{ padding: '28px 24px 24px', background: '#030410', borderTop: `0.5px solid ${GOLD}22`, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 14, color: INK_SOFT, letterSpacing: '0.4em', marginBottom: 6 }}>星詠み</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 10, color: GOLD, letterSpacing: '0.2em', marginBottom: 18 }}>— est. MMXXVI —</div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 18px', fontSize: 10, color: INK_MUTED, letterSpacing: '0.1em', paddingBottom: 14, borderBottom: `0.5px solid ${GOLD}11`, marginBottom: 14 }}>
            <Link href="/terms" style={{ color: INK_MUTED, textDecoration: 'none' }}>利用規約</Link>
            <Link href="/privacy" style={{ color: INK_MUTED, textDecoration: 'none' }}>プライバシーポリシー</Link>
            <Link href="/tokusho" style={{ color: INK_MUTED, textDecoration: 'none' }}>特定商取引法</Link>
            <a href="mailto:beck99119911@outlook.jp" style={{ color: INK_MUTED, textDecoration: 'none' }}>お問い合わせ</a>
          </div>
          <div style={{ fontSize: 9, color: INK_MUTED, letterSpacing: '0.1em', opacity: 0.6 }}>© 2026 Hoshi-yomi · hoshiyomi.xyz</div>
        </footer>

      </main>
    </>
  );
}
