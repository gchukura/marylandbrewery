import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
// Note: Edge runtime caching is handled via Cache-Control headers in the response

const size = {
  width: 1200,
  height: 630,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Maryland Brewery Directory';
    const location = searchParams.get('location') || 'Maryland';

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
              maxWidth: '1000px',
            }}
          >
            {/* Logo emblem - stylized MB */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <span
                style={{
                  fontSize: '120px',
                  fontWeight: 800,
                  color: '#EAAA00',
                  fontFamily: 'Georgia, serif',
                  letterSpacing: '-8px',
                  textShadow: '4px 4px 8px rgba(0,0,0,0.5)',
                  lineHeight: 1,
                }}
              >
                M
              </span>
              <span
                style={{
                  fontSize: '120px',
                  fontWeight: 800,
                  color: '#E03A3E',
                  fontFamily: 'Georgia, serif',
                  letterSpacing: '-8px',
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
                fontSize: '64px',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
                fontFamily: 'Georgia, serif',
                textAlign: 'center',
                textShadow: '3px 3px 6px rgba(0,0,0,0.6)',
                letterSpacing: '-1px',
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>

            {/* Location */}
            {location && (
              <p
                style={{
                  fontSize: '36px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.9)',
                  margin: '20px 0 0 0',
                  fontFamily: 'Arial, sans-serif',
                  textAlign: 'center',
                }}
              >
                {location}
              </p>
            )}

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

            {/* URL badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '24px',
                padding: '12px 32px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50px',
                border: '2px solid rgba(255,255,255,0.25)',
              }}
            >
              <span
                style={{
                  fontSize: '22px',
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
  } catch (error: any) {
    console.error('Error generating OG image:', error);
    return new Response(`Failed to generate image: ${error.message}`, { status: 500 });
  }
}

