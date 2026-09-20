'use client';

import { useState } from 'react';
import type { ExerciseVideo as Video } from '@/lib/program/videos';

/**
 * El vídeo de demostración, cargado solo si se pide. Hasta que se toca no hay
 * iframe: únicamente la miniatura, que es una imagen. Un embed de YouTube trae
 * cientos de kilobytes de reproductor y aquí no se está viendo vídeo, se está
 * entrenando; además la ficha se abre a menudo a mitad de sesión, con la
 * pantalla forzada encendida y la figura 3D ya animándose.
 */
export function ExerciseVideo({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="overflow-hidden rounded-lg bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group block w-full overflow-hidden rounded-lg bg-ink-800 text-left transition active:scale-[0.99]"
    >
      <div className="relative">
        {/* hqdefault existe siempre; maxres falta en bastantes vídeos. */}
        <img
          src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="aspect-video w-full object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-950/75 ring-1 ring-white/25">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="#e6edf5" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </div>
      <span className="block px-3 py-2">
        <span className="block text-[0.92rem] font-semibold leading-snug">{video.title}</span>
        <span className="mt-0.5 block text-[0.82rem] text-ink-300">{video.channel}</span>
      </span>
    </button>
  );
}
