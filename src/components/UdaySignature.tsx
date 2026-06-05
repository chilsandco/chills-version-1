import React from 'react';

const UdaySignature: React.FC = () => {
  return (
    <>
      <style>{`
        #ub-signature {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 999999;
          font-family: Inter, Segoe UI, sans-serif;
        }

        /* ── IDLE BADGE ── */
        #ub-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          background: #0b0b0b;
          color: #D4AF37;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(212,175,55,.25);
          backdrop-filter: blur(16px);
          box-shadow:
            0 10px 30px rgba(0,0,0,.45),
            0 0 20px rgba(212,175,55,.10);
          transition: .35s ease;
          animation: ubFloat 4s ease-in-out infinite;
          user-select: none;
        }
        #ub-badge:hover {
          transform: translateY(-3px);
          box-shadow:
            0 15px 40px rgba(0,0,0,.55),
            0 0 30px rgba(212,175,55,.20);
        }

        /* ── CARD ── */
        #ub-card {
          position: absolute;
          bottom: 65px;
          right: 0;
          width: 340px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(15px);
          transition: .35s ease;
          background: linear-gradient(145deg, #0b0b0b, #141414);
          border: 1px solid rgba(212,175,55,.15);
          border-radius: 24px;
          padding: 20px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 30px 60px rgba(0,0,0,.65),
            0 0 30px rgba(212,175,55,.06);
        }
        #ub-signature:hover #ub-card {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        /* ── PROFILE ── */
        .ub-profile {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .ub-profile img {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid rgba(212,175,55,.45);
        }
        .ub-profile h3 {
          margin: 0;
          color: #F5E6A8;
          font-size: 18px;
        }
        .ub-profile p {
          margin-top: 4px;
          color: #BFA76A;
          font-size: 12px;
        }

        /* ── STEPS ── */
        .ub-step {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #F8F4E8;
          padding: 11px 0;
          border-bottom: 1px solid rgba(212,175,55,.08);
          font-size: 15px;
        }
        .ub-step:last-of-type {
          border-bottom: none;
        }

        /* ── FOOTER ── */
        .ub-footer {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(212,175,55,.10);
          text-align: center;
          color: #D6C28A;
          font-size: 13px;
          line-height: 1.7;
        }
        .ub-footer strong {
          color: #D4AF37;
          font-size: 16px;
        }

        /* ── BUTTONS ── */
        .ub-links {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        .ub-links a {
          text-decoration: none;
          color: #D4AF37;
          border: 1px solid rgba(212,175,55,.18);
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          transition: .3s ease;
        }
        .ub-links a:hover {
          background: rgba(212,175,55,.10);
          transform: translateY(-2px);
        }

        /* ── FLOAT ANIMATION ── */
        @keyframes ubFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          #ub-card  { width: 300px; }
          #ub-badge { font-size: 12px; }
        }
      `}</style>

      <div id="ub-signature">
        <div id="ub-card">
          <div className="ub-profile">
            <img
              src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1778488005/uday_close_up_vswnbv.jpg"
              alt="Uday Boya"
            />
            <div>
              <h3>Uday Boya</h3>
              <p>Designer • Developer</p>
            </div>
          </div>

          <div className="ub-step">
            <span>Idea</span>
            <span>✈</span>
          </div>
          <div className="ub-step">
            <span>Code</span>
            <span>✈</span>
          </div>
          <div className="ub-step">
            <span>Launch</span>
            <span>✈</span>
          </div>

          <div className="ub-footer">
            Designed &amp; Developed by<br />
            <strong>Uday Boya</strong>
            <div className="ub-links">
              <a
                href="https://in.linkedin.com/in/uday-kumar-boya-ai-innovator"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                href="https://wa.me/919392837729"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div id="ub-badge">✈ Crafted by Uday</div>
      </div>
    </>
  );
};

export default UdaySignature;
