import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Maryland Brewery Directory - Discover Craft Breweries Across Maryland';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
// Note: Edge runtime doesn't support revalidate export, caching handled via Cache-Control headers

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        }}
      >
        {/* Maryland flag-inspired decorative top bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '12px',
            display: 'flex',
          }}
        >
          <div style={{ flex: 1, background: '#E03A3E', display: 'flex' }} />
          <div style={{ flex: 1, background: '#EAAA00', display: 'flex' }} />
          <div style={{ flex: 1, background: '#E03A3E', display: 'flex' }} />
          <div style={{ flex: 1, background: '#EAAA00', display: 'flex' }} />
        </div>

        {/* Maryland flag-inspired decorative bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '12px',
            display: 'flex',
          }}
        >
          <div style={{ flex: 1, background: '#EAAA00', display: 'flex' }} />
          <div style={{ flex: 1, background: '#E03A3E', display: 'flex' }} />
          <div style={{ flex: 1, background: '#EAAA00', display: 'flex' }} />
          <div style={{ flex: 1, background: '#E03A3E', display: 'flex' }} />
        </div>

        {/* Left side decorative element */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '12px',
            bottom: '12px',
            width: '40px',
            background: 'linear-gradient(180deg, #E03A3E 0%, #EAAA00 50%, #E03A3E 100%)',
            display: 'flex',
          }}
        />

        {/* Right side decorative element */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '12px',
            bottom: '12px',
            width: '40px',
            background: 'linear-gradient(180deg, #EAAA00 0%, #E03A3E 50%, #EAAA00 100%)',
            display: 'flex',
          }}
        />

        {/* Content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 80px',
          }}
        >
          {/* Logo emblem - stylized MB with hop */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
            }}
          >
            {/* M letter */}
            <span
              style={{
                fontSize: '160px',
                fontWeight: 800,
                color: '#EAAA00',
                fontFamily: 'Georgia, serif',
                letterSpacing: '-12px',
                textShadow: '4px 4px 8px rgba(0,0,0,0.5)',
                lineHeight: 1,
              }}
            >
              M
            </span>
            {/* Hop icon in the middle */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: '0 -25px',
                marginTop: '-20px',
              }}
            >
              {/* Hop stem */}
              <div
                style={{
                  width: '10px',
                  height: '30px',
                  background: '#2d5a27',
                  borderRadius: '5px',
                  display: 'flex',
                }}
              />
              {/* Hop body */}
              <svg
                width="100"
                height="120"
                viewBox="0 0 90 110"
                style={{ marginTop: '-8px' }}
              >
                {/* Hop petals - layered for depth */}
                <ellipse cx="45" cy="30" rx="28" ry="20" fill="#4a7c44" />
                <ellipse cx="25" cy="45" rx="22" ry="18" fill="#3d6b38" />
                <ellipse cx="65" cy="45" rx="22" ry="18" fill="#3d6b38" />
                <ellipse cx="20" cy="65" rx="20" ry="16" fill="#4a7c44" />
                <ellipse cx="70" cy="65" rx="20" ry="16" fill="#4a7c44" />
                <ellipse cx="30" cy="80" rx="22" ry="18" fill="#3d6b38" />
                <ellipse cx="60" cy="80" rx="22" ry="18" fill="#3d6b38" />
                <ellipse cx="45" cy="95" rx="20" ry="15" fill="#4a7c44" />
                {/* Center highlight */}
                <ellipse cx="45" cy="60" rx="12" ry="22" fill="#5a8c54" opacity="0.7" />
              </svg>
            </div>
            {/* B letter */}
            <span
              style={{
                fontSize: '160px',
                fontWeight: 800,
                color: '#E03A3E',
                fontFamily: 'Georgia, serif',
                letterSpacing: '-12px',
                textShadow: '4px 4px 8px rgba(0,0,0,0.5)',
                lineHeight: 1,
              }}
            >
              B
            </span>
          </div>

          {/* Main title */}
          <h1
            style={{
              fontSize: '76px',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              fontFamily: 'Georgia, serif',
              textAlign: 'center',
              textShadow: '3px 3px 6px rgba(0,0,0,0.6)',
              letterSpacing: '-2px',
            }}
          >
            Maryland Brewery
          </h1>

          {/* Divider line with Maryland colors */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              margin: '28px 0',
            }}
          >
            <div
              style={{
                width: '100px',
                height: '4px',
                background: '#EAAA00',
                borderRadius: '2px',
                display: 'flex',
              }}
            />
            <div
              style={{
                width: '14px',
                height: '14px',
                background: '#E03A3E',
                borderRadius: '50%',
                display: 'flex',
              }}
            />
            <div
              style={{
                width: '100px',
                height: '4px',
                background: '#EAAA00',
                borderRadius: '2px',
                display: 'flex',
              }}
            />
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: '30px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.95)',
              margin: 0,
              fontFamily: 'Arial, sans-serif',
              textAlign: 'center',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            Discover Maryland&apos;s Craft Beer Scene
          </p>

          {/* URL badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '32px',
              padding: '14px 40px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50px',
              border: '2px solid rgba(255,255,255,0.25)',
            }}
          >
            <span
              style={{
                fontSize: '26px',
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '2px',
              }}
            >
              marylandbrewery.com
            </span>
          </div>
        </div>

        {/* Corner accents */}
        <div
          style={{
            position: 'absolute',
            top: '30px',
            left: '60px',
            width: '50px',
            height: '50px',
            borderTop: '4px solid #EAAA00',
            borderLeft: '4px solid #EAAA00',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30px',
            right: '60px',
            width: '50px',
            height: '50px',
            borderTop: '4px solid #E03A3E',
            borderRight: '4px solid #E03A3E',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '60px',
            width: '50px',
            height: '50px',
            borderBottom: '4px solid #E03A3E',
            borderLeft: '4px solid #E03A3E',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '60px',
            width: '50px',
            height: '50px',
            borderBottom: '4px solid #EAAA00',
            borderRight: '4px solid #EAAA00',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      ...size,
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=1800, immutable',
      },
    }
  );
}
