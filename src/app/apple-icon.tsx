import { ImageResponse } from 'next/og';

/**
 * iOS needs a real PNG for "Add to Home Screen" — an SVG will not do — so the
 * icon is generated at build time rather than committed as a binary.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const HOLES: [number, number][] = [
  [50, 26], [26, 38], [74, 38], [50, 50], [26, 62], [74, 62], [50, 74],
];

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #16202b 0%, #080b0f 100%)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 106,
            height: 106,
            borderRadius: 53,
            background: 'linear-gradient(135deg, #e4ff6b 0%, #a8cc12 100%)',
            display: 'flex',
          }}
        >
          {HOLES.map(([x, y]) => (
            <div
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                left: (x / 100) * 106 - 7,
                top: (y / 100) * 106 - 7,
                width: 14,
                height: 14,
                borderRadius: 7,
                background: '#0d1218',
              }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
