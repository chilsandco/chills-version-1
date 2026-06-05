import React from 'react';

const UdaySignature: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {/* Avatar */}
      <img
        src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1778488005/uday_close_up_vswnbv.jpg"
        alt="Uday Boya"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '1.5px solid rgba(212,175,55,0.5)',
          flexShrink: 0,
        }}
      />

      {/* Text */}
      <p style={{ color: '#7a7a7a', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>
        Designed &amp; Developed by&nbsp;
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>Uday Boya</span>
      </p>

      {/* Divider */}
      <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', display: 'inline-block' }} />

      {/* Links */}
      <div style={{ display: 'flex', gap: 8 }}>
        <a
          href="https://in.linkedin.com/in/uday-kumar-boya-ai-innovator"
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#D4AF37',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            border: '1px solid rgba(212,175,55,0.2)',
            padding: '4px 10px',
            borderRadius: 999,
            transition: 'background 0.25s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.10)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          LinkedIn
        </a>
        <a
          href="https://wa.me/919392837729"
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#D4AF37',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            border: '1px solid rgba(212,175,55,0.2)',
            padding: '4px 10px',
            borderRadius: 999,
            transition: 'background 0.25s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.10)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
};

export default UdaySignature;
