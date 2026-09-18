import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MyTraining',
    short_name: 'MyTraining',
    description: 'Entrenamiento en casa para jugar al pickleball sin lesiones.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#080b0f',
    theme_color: '#080b0f',
    lang: 'es',
    // iOS takes its home-screen icon from the generated apple-icon route; the
    // SVG covers every other installer at any size.
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
