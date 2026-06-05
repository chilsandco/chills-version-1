import React, { useState, useRef, useEffect } from 'react';

const UdaySignature: React.FC = () => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside tap (mobile)
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  return (
    <>
      <style>{`

        /* ══════════════════════════════════════
           ORBIT SYSTEM
        ══════════════════════════════════════ */

        .ub-orbit-system {
          position: relative;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }

        /* Centre sphere */
        .ub-orbit-core {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #f5d97a, #b8860b);
          box-shadow:
            0 0 8px rgba(212,175,55,.7),
            0 0 20px rgba(212,175,55,.3);
        }

        /* Monogram */
        .ub-orbit-core span {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 7px;
          font-weight: 900;
          color: #000;
          letter-spacing: 0;
          line-height: 1;
          font-family: Inter, sans-serif;
        }

        /* Orbit ring — tilted like Saturn */
        .ub-orbit-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(212,175,55,.20);
          transform: rotateX(58deg) rotateZ(-20deg);
        }

        /* Spinning arm */
        .ub-orbit-arm {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          animation: ub-spin 1.8s linear infinite;
        }

        /* Comet dot */
        .ub-orbit-dot {
          position: absolute;
          top: -3px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #D4AF37;
          box-shadow:
            0 0 4px #D4AF37,
            0 0 10px rgba(212,175,55,.8),
            0 0 20px rgba(212,175,55,.4);
        }

        /* Comet tail */
        .ub-orbit-dot::after {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(90deg);
          width: 2px;
          height: 12px;
          background: linear-gradient(to bottom, rgba(212,175,55,.6), transparent);
          border-radius: 2px;
        }

        @keyframes ub-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Pulse ring on hover */
        .ub-orbit-system::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid rgba(212,175,55,.0);
          transition: border-color .3s, box-shadow .3s;
        }
        .ub-badge-wrap:hover .ub-orbit-system::after {
          border-color: rgba(212,175,55,.15);
          box-shadow: 0 0 14px rgba(212,175,55,.15);
        }

        /* ══════════════════════════════════════
           BADGE PILL
        ══════════════════════════════════════ */

        .ub-badge-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .ub-badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 7px 15px 7px 10px;
          border-radius: 999px;
          background: #0c0c0c;
          border: 1px solid rgba(212,175,55,.22);
          color: #C9A84C;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          user-select: none;
          transition: border-color .35s, box-shadow .35s, color .35s;
          white-space: nowrap;
          font-family: Inter, sans-serif;
        }

        .ub-badge-wrap:hover .ub-badge {
          border-color: rgba(212,175,55,.45);
          box-shadow: 0 0 22px rgba(212,175,55,.12);
          color: #D4AF37;
        }

        /* ══════════════════════════════════════
           HOVER CARD
        ══════════════════════════════════════ */

        @keyframes ub-card-rise {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ub-step-in {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .ub-card {
          position: absolute;
          bottom: calc(100% + 14px);
          right: 0;
          width: 290px;
          background: linear-gradient(145deg, #0d0d0d 0%, #161616 100%);
          border: 1px solid rgba(212,175,55,.18);
          border-radius: 20px;
          padding: 20px;
          box-shadow:
            0 32px 60px rgba(0,0,0,.75),
            0 0 35px rgba(212,175,55,.07),
            inset 0 1px 0 rgba(212,175,55,.06);
          animation: ub-card-rise .28s cubic-bezier(.22,1,.36,1) forwards;
          z-index: 99999;
          font-family: Inter, sans-serif;
        }

        /* Down-arrow caret */
        .ub-card::after {
          content: '';
          position: absolute;
          bottom: -7px;
          right: 20px;
          width: 13px;
          height: 13px;
          background: #161616;
          border-right: 1px solid rgba(212,175,55,.18);
          border-bottom: 1px solid rgba(212,175,55,.18);
          transform: rotate(45deg);
        }

        /* Profile row */
        .ub-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(212,175,55,.08);
        }
        .ub-profile img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(212,175,55,.4);
          flex-shrink: 0;
        }
        .ub-profile-name {
          color: #F5E6A8;
          font-size: 15px;
          font-weight: 700;
          margin: 0;
        }
        .ub-profile-role {
          color: #9A7E4A;
          font-size: 11px;
          margin-top: 3px;
          letter-spacing: .07em;
        }

        /* Steps */
        .ub-step {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid rgba(212,175,55,.06);
          color: #E8DFC8;
          font-size: 13px;
          opacity: 0;
        }
        .ub-step:last-child { border-bottom: none; }
        .ub-step:nth-child(1) { animation: ub-step-in .22s .04s ease forwards; }
        .ub-step:nth-child(2) { animation: ub-step-in .22s .11s ease forwards; }
        .ub-step:nth-child(3) { animation: ub-step-in .22s .18s ease forwards; }
        .ub-step-plane { font-size: 15px; }

        /* Footer credit */
        .ub-credit {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid rgba(212,175,55,.08);
          text-align: center;
          color: #7A6A44;
          font-size: 11px;
          line-height: 1.8;
          letter-spacing: .07em;
        }
        .ub-credit strong {
          display: block;
          color: #D4AF37;
          font-size: 14px;
          font-weight: 700;
          margin-top: 1px;
        }

        .ub-links {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
        }
        .ub-links a {
          text-decoration: none;
          color: #D4AF37;
          border: 1px solid rgba(212,175,55,.22);
          padding: 5px 13px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          transition: background .22s, transform .2s;
        }
        .ub-links a:hover {
          background: rgba(212,175,55,.12);
          transform: translateY(-2px);
        }
        /* Mobile: card opens upward, shifts left to avoid overflow */
        @media (max-width: 640px) {
          .ub-card {
            width: 260px;
            right: auto;
            left: 50%;
            transform: translateX(-50%);
          }
          .ub-card::after {
            right: auto;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
          }
        }
      `}</style>

      <div
        ref={wrapRef}
        className="ub-badge-wrap"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(prev => !prev)}
      >

        {/* ── HOVER CARD ── */}
        {open && (
          <div className="ub-card">

            <div className="ub-profile">
              <img
                src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1778488005/uday_close_up_vswnbv.jpg"
                alt="Uday Boya"
              />
              <div>
                <p className="ub-profile-name">Uday Boya</p>
                <p className="ub-profile-role">Designer • Developer</p>
              </div>
            </div>

            <div>
              <div className="ub-step"><span>Idea</span><span className="ub-step-plane">✈</span></div>
              <div className="ub-step"><span>Code</span><span className="ub-step-plane">✈</span></div>
              <div className="ub-step"><span>Launch</span><span className="ub-step-plane">✈</span></div>
            </div>

            <div className="ub-credit">
              Designed &amp; Developed by
              <strong>Uday Boya</strong>
              <div className="ub-links">
                <a href="https://in.linkedin.com/in/uday-kumar-boya-ai-innovator" target="_blank" rel="noreferrer">LinkedIn</a>
                <a href="https://wa.me/919392837729" target="_blank" rel="noreferrer">WhatsApp</a>
              </div>
            </div>

          </div>
        )}

        {/* ── BADGE ── */}
        <div className="ub-badge">

          {/* Orbit system */}
          <div className="ub-orbit-system">
            <div className="ub-orbit-ring" />
            <div className="ub-orbit-core"><span>U</span></div>
            <div className="ub-orbit-arm">
              <div className="ub-orbit-dot" />
            </div>
          </div>

          Crafted by Uday

        </div>
      </div>
    </>
  );
};

export default UdaySignature;
