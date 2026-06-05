import React, { useState } from 'react';

const UdaySignature: React.FC = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <style>{`
        /* ── PEN→KEYBOARD ICON ANIMATION ── */
        @keyframes ub-pen-bob {
          0%, 100% { transform: translateY(0) rotate(-15deg); }
          50%       { transform: translateY(-4px) rotate(-10deg); }
        }
        @keyframes ub-key-tap {
          0%, 100% { transform: scaleY(1); }
          50%       { transform: scaleY(0.82); }
        }
        @keyframes ub-dot-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes ub-step-slide {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ub-card-in {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .ub-pen {
          display: inline-block;
          animation: ub-pen-bob 1s ease-in-out infinite;
          transform-origin: bottom right;
          font-size: 14px;
        }
        .ub-key {
          display: inline-block;
          animation: ub-key-tap 0.45s ease-in-out infinite alternate;
          font-size: 14px;
        }
        .ub-cursor-dot {
          display: inline-block;
          width: 2px;
          height: 13px;
          background: #D4AF37;
          border-radius: 1px;
          margin-left: 1px;
          vertical-align: middle;
          animation: ub-dot-blink 0.9s ease-in-out infinite;
        }
        .ub-badge-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .ub-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: 999px;
          background: #0c0c0c;
          border: 1px solid rgba(212,175,55,.22);
          color: #D4AF37;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          cursor: default;
          user-select: none;
          transition: border-color .3s, box-shadow .3s;
          white-space: nowrap;
        }
        .ub-badge-wrap:hover .ub-badge {
          border-color: rgba(212,175,55,.5);
          box-shadow: 0 0 18px rgba(212,175,55,.12);
        }

        /* ── HOVER CARD ── */
        .ub-card {
          position: absolute;
          bottom: calc(100% + 12px);
          right: 0;
          width: 300px;
          background: linear-gradient(145deg, #0c0c0c, #141414);
          border: 1px solid rgba(212,175,55,.18);
          border-radius: 20px;
          padding: 20px;
          box-shadow:
            0 28px 55px rgba(0,0,0,.7),
            0 0 30px rgba(212,175,55,.07);
          animation: ub-card-in .28s ease forwards;
          backdrop-filter: blur(20px);
          z-index: 99999;
        }

        /* arrow pointing down */
        .ub-card::after {
          content: '';
          position: absolute;
          bottom: -7px;
          right: 22px;
          width: 13px;
          height: 13px;
          background: #141414;
          border-right: 1px solid rgba(212,175,55,.18);
          border-bottom: 1px solid rgba(212,175,55,.18);
          transform: rotate(45deg);
        }

        .ub-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(212,175,55,.08);
        }
        .ub-profile img {
          width: 52px;
          height: 52px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid rgba(212,175,55,.45);
          flex-shrink: 0;
        }
        .ub-profile-name {
          color: #F5E6A8;
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          letter-spacing: 0.02em;
        }
        .ub-profile-role {
          color: #BFA76A;
          font-size: 11px;
          margin-top: 3px;
          letter-spacing: 0.08em;
        }

        .ub-steps {
          margin-bottom: 14px;
        }
        .ub-step {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid rgba(212,175,55,.07);
          color: #F0EAD6;
          font-size: 13px;
          letter-spacing: 0.04em;
        }
        .ub-step:last-child { border-bottom: none; }
        .ub-step span:last-child { font-size: 16px; }

        .ub-step:nth-child(1) { animation: ub-step-slide .25s .05s ease both; }
        .ub-step:nth-child(2) { animation: ub-step-slide .25s .12s ease both; }
        .ub-step:nth-child(3) { animation: ub-step-slide .25s .19s ease both; }

        .ub-footer-credit {
          padding-top: 14px;
          border-top: 1px solid rgba(212,175,55,.09);
          text-align: center;
          color: #A0906A;
          font-size: 11px;
          line-height: 1.8;
          letter-spacing: 0.06em;
        }
        .ub-footer-credit strong {
          display: block;
          color: #D4AF37;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.04em;
          margin-top: 2px;
        }

        .ub-links {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .ub-links a {
          text-decoration: none;
          color: #D4AF37;
          border: 1px solid rgba(212,175,55,.20);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: background .25s, transform .2s;
        }
        .ub-links a:hover {
          background: rgba(212,175,55,.12);
          transform: translateY(-2px);
        }
      `}</style>

      <div
        className="ub-badge-wrap"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── HOVER CARD ── */}
        {hovered && (
          <div className="ub-card">
            {/* Profile */}
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

            {/* Steps */}
            <div className="ub-steps">
              <div className="ub-step"><span>Idea</span><span>✈</span></div>
              <div className="ub-step"><span>Code</span><span>✈</span></div>
              <div className="ub-step"><span>Launch</span><span>✈</span></div>
            </div>

            {/* Footer credit */}
            <div className="ub-footer-credit">
              Designed &amp; Developed by
              <strong>Uday Boya</strong>
              <div className="ub-links">
                <a
                  href="https://in.linkedin.com/in/uday-kumar-boya-ai-innovator"
                  target="_blank"
                  rel="noreferrer"
                >LinkedIn</a>
                <a
                  href="https://wa.me/919392837729"
                  target="_blank"
                  rel="noreferrer"
                >WhatsApp</a>
              </div>
            </div>
          </div>
        )}

        {/* ── BADGE ── */}
        <div className="ub-badge">
          <span className="ub-pen">✒</span>
          <span className="ub-key">⌨</span>
          <span className="ub-cursor-dot" />
          Crafted by Uday
        </div>
      </div>
    </>
  );
};

export default UdaySignature;
