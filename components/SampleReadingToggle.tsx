'use client';
import { useState } from 'react';

const GOLD = '#c8944a';
const GOLD_BRIGHT = '#e8c078';
const INK_SOFT = '#f3e9d2';
const INK_MUTED = '#a89878';

function BeforeCard() {
  return (
    <div style={{
      padding: 22,
      background: 'linear-gradient(180deg, rgba(15,18,40,0.5), rgba(10,10,28,0.5))',
      border: '0.5px solid rgba(120,120,160,0.25)',
      borderRadius: 3,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(120,120,160,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.5px solid rgba(255,255,255,0.15)', fontSize: 14, color: 'rgba(200,200,220,0.6)' }}>?</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: 'rgba(200,200,220,0.5)', letterSpacing: '0.2em', marginBottom: 2 }}>BEFORE · 鑑定前</div>
          <div style={{ fontSize: 13, color: 'rgba(200,200,220,0.8)', fontWeight: 500 }}>今日のあなた、靄（もや）の中。</div>
        </div>
      </div>
      <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 13, lineHeight: 2.1, color: 'rgba(200,200,220,0.7)', fontWeight: 300 }}>
        <p style={{ margin: '0 0 10px' }}>「なぜか、最近うまくいかない。」</p>
        <p style={{ margin: '0 0 10px' }}>「この人との関係、続けるべき？」</p>
        <p style={{ margin: '0 0 10px' }}>「自分の本当の才能って、なんだろう。」</p>
        <p style={{ margin: 0, color: 'rgba(200,200,220,0.45)', fontStyle: 'italic', fontSize: 12 }}>
          ——答えのない問いが、心の底に積もっている。
        </p>
      </div>
      <div style={{ position: 'absolute', top: 10, right: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'rgba(200,200,220,0.3)', letterSpacing: '0.3em' }}>UNREAD</div>
    </div>
  );
}

function AfterCard() {
  return (
    <div style={{ padding: 1, borderRadius: 4, background: `linear-gradient(160deg, ${GOLD_BRIGHT}, ${GOLD}33, #6a4ba8, ${GOLD_BRIGHT})`, boxShadow: `0 0 32px rgba(200,148,74,0.25)` }}>
      <div style={{ padding: '22px 20px', background: 'linear-gradient(180deg, #0a0820 0%, #0d0a28 100%)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 200 200" style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, opacity: 0.15, pointerEvents: 'none' }}>
          <circle cx="100" cy="100" r="90" fill="none" stroke={GOLD} strokeWidth="0.3"/>
          <circle cx="100" cy="100" r="60" fill="none" stroke={GOLD} strokeWidth="0.3"/>
          {Array.from({length:12}).map((_,i)=>{
            const a = (i*30-90)*Math.PI/180;
            return <line key={i} x1={100+60*Math.cos(a)} y1={100+60*Math.sin(a)} x2={100+90*Math.cos(a)} y2={100+90*Math.sin(a)} stroke={GOLD} strokeWidth="0.3"/>
          })}
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: `0.5px solid ${GOLD}44`, position: 'relative' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `radial-gradient(circle, ${GOLD_BRIGHT}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 10px ${GOLD}88` }}>
            <svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 1 L14.5 9 L22 9.5 L16 14.5 L18 22 L12 17.5 L6 22 L8 14.5 L2 9.5 L9.5 9 Z" fill="#1a1205"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: GOLD, letterSpacing: '0.3em', marginBottom: 2 }}>AFTER · 鑑定結果</div>
            <div style={{ fontSize: 13, color: INK_SOFT, fontWeight: 500, fontFamily: "'Noto Serif JP', serif" }}>蠍座・太陽／月は魚座・運命数7</div>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 20, color: GOLD_BRIGHT, lineHeight: 1 }}>&ldquo;</div>
        </div>
        <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 13, lineHeight: 2.15, color: INK_SOFT, fontWeight: 400, position: 'relative' }}>
          <p style={{ margin: '0 0 12px' }}>
            あなたの<span style={{ color: GOLD_BRIGHT, borderBottom: `0.5px solid ${GOLD}` }}>太陽は蠍座</span>。
            表面に見せる以上の、深い情熱と洞察力を宿しています。
          </p>
          <p style={{ margin: '0 0 12px' }}>
            最近の停滞は、偶然ではありません。運命数<span style={{ color: GOLD_BRIGHT, fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontStyle: 'italic' }}>7</span>のあなたは、3月末から<span style={{ color: GOLD_BRIGHT }}>内省の季節</span>に入っています。
          </p>
          <p style={{ margin: 0, color: INK_SOFT, fontWeight: 500 }}>
            5月9日、<span style={{ background: `linear-gradient(180deg, ${GOLD_BRIGHT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 } as React.CSSProperties}>金星があなたの第7ハウスに入ります。</span>
            待っていた答えが、ひとつ訪れる日です。
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 18, paddingTop: 14, borderTop: `0.5px solid ${GOLD}22` }}>
          {['#洞察','#内省の季節','#第7ハウス','#金星の訪れ','#5月9日'].map(t => (
            <span key={t} style={{ fontSize: 10, padding: '3px 8px', background: `${GOLD}11`, color: GOLD_BRIGHT, border: `0.5px solid ${GOLD}44`, letterSpacing: '0.05em' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SampleReadingToggle() {
  const [flipped, setFlipped] = useState(false);

  return (
    <section style={{
      position: 'relative',
      padding: '56px 24px 48px',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(70,30,120,0.35), transparent 60%), linear-gradient(180deg, #0a0820 0%, #070618 100%)',
    }}>
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 13, letterSpacing: '0.3em', color: GOLD }}>A GLIMPSE OF TRUTH</div>
          <div style={{ width: 24, height: 1, background: GOLD }} />
          <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 10, letterSpacing: '0.4em', color: INK_MUTED, fontWeight: 500 }}>鑑定のサンプル</div>
        </div>

        <h2 style={{ margin: '0 0 8px', textAlign: 'center', fontFamily: "'Noto Serif JP', serif", fontWeight: 500, fontSize: 24, lineHeight: 1.5, color: INK_SOFT }}>
          曖昧な今日が、<br />
          <span style={{ background: `linear-gradient(180deg, ${GOLD_BRIGHT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 } as React.CSSProperties}>物語に変わる瞬間</span>
        </h2>
        <p style={{ textAlign: 'center', margin: '0 0 26px', color: INK_MUTED, fontSize: 11.5, lineHeight: 1.9, letterSpacing: '0.1em' }}>
          実際の鑑定文を、ほんの少しお見せします。
        </p>

        <div style={{ display: 'flex', background: 'rgba(5,8,20,0.6)', border: `0.5px solid ${GOLD}44`, borderRadius: 2, padding: 3, marginBottom: 20 }}>
          {['BEFORE', 'AFTER'].map((label, i) => (
            <button key={label} onClick={() => setFlipped(i === 1)} style={{
              flex: 1, padding: '10px 0',
              background: (i === 0 && !flipped) || (i === 1 && flipped) ? `linear-gradient(180deg, ${GOLD_BRIGHT}, ${GOLD})` : 'transparent',
              color: (i === 0 && !flipped) || (i === 1 && flipped) ? '#1a1205' : INK_MUTED,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              letterSpacing: '0.3em', fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.3s',
              borderRadius: 1,
            }}>{label}</button>
          ))}
        </div>

        {!flipped ? <BeforeCard /> : <AfterCard />}

        <div style={{ marginTop: 20, padding: 14, border: `0.5px dashed ${GOLD}44`, textAlign: 'center', fontFamily: "'Noto Serif JP', serif", fontSize: 11, lineHeight: 1.8, color: INK_SOFT, letterSpacing: '0.08em' }}>
          <span style={{ color: GOLD_BRIGHT, fontWeight: 600 }}>※ 実際の鑑定結果はさらに詳しくお伝えします。</span><br />
          <span style={{ color: INK_MUTED, fontSize: 10 }}>無料 · 登録不要 · 3分で完了</span>
        </div>
      </div>
    </section>
  );
}
