import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Ticket,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Volume2,
  Volume1,
  VolumeX,
  Radio
} from 'lucide-react';
import { Button } from './Button';
import { TourShow } from '@merch-band/shared';
import { useTranslation } from '../i18n/translations';

interface HeroSliderProps {
  onOpenTicketModal: (show: TourShow) => void;
  tourShows: TourShow[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onOpenTicketModal, tourShows }) => {
  const { lang, t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(14.1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const slides = [
    {
      id: 'apparel',
      categoryBadge: lang === 'id' ? 'DROP RESMI FW26' : 'OFFICIAL FW26 DROP',
      titleHighlight: 'WEAR THE',
      titleMain: 'NOISE.',
      subtitle:
        lang === 'id'
          ? 'Koleksi kaos boxy fit 280gsm dan hoodie katun tebal edisi terbatas. Dibuat untuk moshpit, dicetak sablon tangan.'
          : 'Heavyweight 280gsm boxy fit tees and custom fleece hoodies. Built for the moshpit, hand screen-printed.',
      metaBadges: [
        { label: lang === 'id' ? 'EDISI 500 PCS' : 'LIMITED 500 PCS', bg: 'bg-[#FFE600]', text: 'text-ink' },
        { label: '280GSM ORGANIC', bg: 'bg-white', text: 'text-ink' },
        { label: lang === 'id' ? 'BEBAS ONGKIR' : 'FREE SHIPPING', bg: 'bg-emerald-100', text: 'text-emerald-900' }
      ],
      primaryCta: {
        label: lang === 'id' ? 'BELANJA KOLEKSI' : 'SHOP COLLECTION',
        link: '/shop'
      },
      secondaryCta: {
        label: lang === 'id' ? 'LIHAT DETAIL TEE' : 'VIEW TEE DETAILS',
        link: '/product/void-rose-tee'
      },
      visual: {
        imageUrl: '/assets/products/void-rose-tee.svg',
        productSlug: 'void-rose-tee',
        badgeTitle: lang === 'id' ? 'HANYA' : 'ONLY',
        badgeValue: '500 PCS',
        footerTag: 'VOID ROSE TEE — RP 350.000'
      },
      audioSnippet: {
        title: 'VOID/ROSE — THORN SYMPHONY',
        bpm: '136 BPM • RINGTONE HOOK'
      }
    },
    {
      id: 'tour',
      categoryBadge: lang === 'id' ? 'TIKET RESMI 2026' : 'OFFICIAL 2026 PASSES',
      titleHighlight: 'ASIA TOUR',
      titleMain: 'PASSES.',
      subtitle:
        lang === 'id'
          ? 'Tur utama di Jakarta, Bandung, dan Singapore. Dapatkan E-Ticket instan dengan barcode resmi & akses VIP Noise Pass.'
          : 'Headlining shows across Jakarta, Bandung, and Singapore. Instant barcode E-Tickets with VIP Noise Pass access.',
      metaBadges: [
        { label: 'JAKARTA • 14 NOV', bg: 'bg-brand', text: 'text-white' },
        { label: 'BANDUNG • 21 NOV', bg: 'bg-brand', text: 'text-white' },
        { label: 'SINGAPORE • 05 DEC', bg: 'bg-brand', text: 'text-white' }
      ],
      primaryCta: {
        label: lang === 'id' ? 'BELI TIKET TOUR' : 'GET TOUR TICKETS',
        action: 'ticket'
      },
      secondaryCta: {
        label: lang === 'id' ? 'JADWAL LENGKAP' : 'FULL TOUR DATES',
        link: '#tour'
      },
      visual: {
        imageUrl: '/assets/products/tour-ticket.svg',
        badgeTitle: 'ALL-ACCESS',
        badgeValue: 'VIP PASS',
        footerTag: 'FESTIVAL GA FROM RP 350.000'
      },
      audioSnippet: {
        title: 'LIVE AT SENAYAN ARENA TEASER',
        bpm: '136 BPM • LIVE RIFF'
      }
    },
    {
      id: 'vinyl',
      categoryBadge: lang === 'id' ? 'EDISI KOLEKTOR' : 'COLLECTOR EDITION',
      titleHighlight: 'STATIC',
      titleMain: 'BLOOM LP.',
      subtitle:
        lang === 'id'
          ? 'Piringan hitam 180g heavy smoke vinyl, gatefold sleeve embossed foil dengan zine lirik eksklusif & download code lossless.'
          : '180g heavy clear smoke vinyl, foil-embossed gatefold jacket with exclusive lyric zine & lossless audio download code.',
      metaBadges: [
        { label: '180G VINYL', bg: 'bg-white', text: 'text-ink' },
        { label: lang === 'id' ? 'ZINE 24 HAL' : '24P LYRIC ZINE', bg: 'bg-[#FFE600]', text: 'text-ink' },
        { label: 'ANALOG MASTER', bg: 'bg-brand', text: 'text-white' }
      ],
      primaryCta: {
        label: lang === 'id' ? 'PRE-ORDER VINYL' : 'PRE-ORDER VINYL',
        link: '/product/static-bloom-lp'
      },
      secondaryCta: {
        label: lang === 'id' ? 'SEMUA MERCH' : 'ALL MERCHANDISE',
        link: '/shop?category=VINYL'
      },
      visual: {
        imageUrl: '/assets/products/static-bloom-lp.svg',
        productSlug: 'static-bloom-lp',
        badgeTitle: 'FIRST PRESS',
        badgeValue: '300 COPIES',
        footerTag: '180G GATEFOLD SLEEVE'
      },
      audioSnippet: {
        title: 'SIDE A: STATIC BLOOM (ANALOG MASTER)',
        bpm: '136 BPM • 33 1/3 RPM'
      }
    }
  ];

  // Auto-advance timer (every 6 seconds unless hovered/paused)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Sync volume with HTML5 audio element
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      const restoredVol = volume > 0 ? volume : 0.75;
      if (audioRef.current) {
        audioRef.current.volume = restoredVol;
      }
    } else {
      setIsMuted(true);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  };

  const handleToggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch((err) => {
          console.warn('Playback error or blocked by autoplay policy:', err);
        });
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const current = slides[currentSlide];

  return (
    <div
      className="w-full bg-surface/30 border-b-4 border-ink select-none relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. TOP COMMERCIAL BROADCAST STRIP & MINI PLAYER */}
      <div className="w-full max-w-full bg-ink text-white border-b-3 border-ink px-3 sm:px-8 py-2 flex items-center justify-between font-mono text-[11px] font-bold gap-2 overflow-x-hidden">
        <div className="flex items-center space-x-3 shrink-0">
          <span className="flex items-center text-[#FFE600] animate-pulse">
            <Radio className="w-3.5 h-3.5 mr-1.5" />
            LIVE SHOWCASE
          </span>
          <span className="text-white/40 hidden md:inline">•</span>
          <span className="hidden md:inline text-white/90">
            {lang === 'id' ? 'TUR ASIA TENGGARA 2026 & DROP EKSKLUSIF' : 'SOUTHEAST ASIA TOUR 2026 & EXCLUSIVE MERCH DROP'}
          </span>
        </div>

        {/* Compact Mini Player in Broadcast Strip */}
        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto sm:ml-0 shrink-0">
          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`flex items-center space-x-1.5 px-2.5 py-1 border-2 border-white/80 transition-all cursor-pointer font-bold ${isPlayingAudio ? 'bg-[#FFE600] text-ink shadow-xs' : 'bg-white/10 text-white hover:bg-white/25'
              }`}
            title={isPlayingAudio ? (lang === 'id' ? 'Jeda Ringtone' : 'Pause Ringtone') : (lang === 'id' ? 'Putar Ringtone No-Copyright' : 'Play No-Copyright Ringtone')}
            id="hero-audio-play-pause-btn"
          >
            {isPlayingAudio ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current text-[#FFE600]" />
            )}
            <span className="text-[10px] uppercase font-mono tracking-wider">
              {isPlayingAudio
                ? (lang === 'id' ? 'PAUSE' : 'PAUSE')
                : (lang === 'id' ? 'PLAY DEMO' : 'PLAY DEMO')}
            </span>
          </button>

          {/* Equalizer Waveform Bars */}
          <div className="flex items-end space-x-0.5 h-3.5 px-0.5" title={isPlayingAudio ? 'Playing' : 'Paused'}>
            <span className={`w-1 bg-[#FFE600] transition-all duration-150 ${isPlayingAudio ? 'h-3.5 animate-pulse' : 'h-1.5'}`} />
            <span className={`w-1 bg-[#FFE600] transition-all duration-200 ${isPlayingAudio ? 'h-2 animate-bounce' : 'h-3'}`} />
            <span className={`w-1 bg-[#FFE600] transition-all duration-100 ${isPlayingAudio ? 'h-3.5 animate-pulse' : 'h-2'}`} />
            <span className={`w-1 bg-[#FFE600] transition-all duration-300 ${isPlayingAudio ? 'h-1.5 animate-bounce' : 'h-2.5'}`} />
          </div>

          {/* Volume Control (hidden on mobile, visible on tablet & desktop) */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-black/50 border border-white/40 px-2 py-0.5">
            <button
              type="button"
              onClick={toggleMute}
              className="text-white hover:text-[#FFE600] cursor-pointer"
              title={isMuted ? (lang === 'id' ? 'Aktifkan Suara' : 'Unmute') : (lang === 'id' ? 'Matikan Suara' : 'Mute')}
              aria-label="Toggle Mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-3.5 h-3.5 text-[#FFE600]" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#FFE600]" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-12 sm:w-14 h-1 accent-[#FFE600] cursor-pointer"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              aria-label="Adjust Volume"
            />
            <span className="font-mono text-[9px] text-[#FFE600] w-6 text-right hidden sm:inline">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN COMPACT COMMERCIAL HERO (NOT 100vh) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[440px]">
          {/* Left Column: Typography, Badges, Dual CTA & Dedicated Mini Player */}
          <div className="lg:col-span-7 space-y-5">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block bg-brand text-white border-2 border-ink px-3 py-1 font-mono text-xs font-bold uppercase shadow-xs">
                {current.categoryBadge}
              </span>
              {current.metaBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className={`inline-block ${badge.bg} ${badge.text} border-2 border-ink px-2.5 py-1 font-mono text-[11px] font-bold uppercase shadow-xs`}
                >
                  {badge.label}
                </span>
              ))}
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[72px] leading-[0.94] tracking-tighter text-ink uppercase">
              {current.titleHighlight} <span className="text-brand">{current.titleMain}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-ink/80 max-w-xl leading-relaxed font-body">
              {current.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              {current.primaryCta.action === 'ticket' ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => onOpenTicketModal(tourShows[0])}
                  id="hero-slider-primary-btn"
                >
                  <Ticket className="w-5 h-5 mr-1.5" />
                  {current.primaryCta.label}
                </Button>
              ) : (
                <Link to={current.primaryCta.link || '/shop'}>
                  <Button variant="primary" size="lg" id="hero-slider-primary-btn">
                    {current.primaryCta.label} <ArrowRight className="w-5 h-5 ml-1.5" />
                  </Button>
                </Link>
              )}

              {current.secondaryCta.link?.startsWith('#') ? (
                <a href={current.secondaryCta.link}>
                  <Button variant="outline" size="lg" id="hero-slider-secondary-btn">
                    {current.secondaryCta.label}
                  </Button>
                </a>
              ) : (
                <Link to={current.secondaryCta.link || '/shop'}>
                  <Button variant="outline" size="lg" id="hero-slider-secondary-btn">
                    {current.secondaryCta.label}
                  </Button>
                </Link>
              )}
            </div>

            {/* 3. DEDICATED NEO-BRUTALIST MINI AUDIO PLAYER */}
            <div className="pt-2">
              <div className="p-2.5 sm:p-3 bg-white border-3 border-ink shadow-sm w-full max-w-lg lg:max-w-xl transition-all">
                <div className="flex items-center justify-between gap-2 sm:gap-3 w-full min-w-0">
                  {/* Left: Play/Pause button + Track Info */}
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={handleToggleAudio}
                      className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center bg-[#FFE600] text-ink border-2 border-ink shadow-xs hover:bg-yellow-300 active:translate-y-0.5 cursor-pointer transition-colors"
                      title={isPlayingAudio ? (lang === 'id' ? 'Jeda Ringtone' : 'Pause Ringtone') : (lang === 'id' ? 'Putar Ringtone No-Copyright' : 'Play No-Copyright Ringtone')}
                      id="hero-miniplayer-main-btn"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-ink" />
                      ) : (
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-ink ml-0.5" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-800/40 px-1 py-0.2 uppercase tracking-wide shrink-0">
                          NO COPYRIGHT
                        </span>
                        <span className="font-mono text-xs font-bold text-ink truncate">
                          Void Rose — Ringtone
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-mono text-ink/70 mt-0.5">
                        <span className="text-brand font-semibold shrink-0">136 BPM</span>
                        <span>•</span>
                        <span className="truncate">{formatTime(currentTime)} / {formatTime(duration || 14.1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Volume & Waveform */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Equalizer animation */}
                    <div className="flex items-end space-x-0.5 h-4 sm:h-5 px-1 bg-surface/50 border border-ink/20 py-0.5 shrink-0" title={isPlayingAudio ? 'Audio Active' : 'Audio Paused'}>
                      <span className={`w-0.5 sm:w-1 bg-brand transition-all ${isPlayingAudio ? 'h-3.5 sm:h-4 animate-pulse' : 'h-1'}`} />
                      <span className={`w-0.5 sm:w-1 bg-brand transition-all ${isPlayingAudio ? 'h-2 sm:h-2.5 animate-bounce' : 'h-1.5'}`} />
                      <span className={`w-0.5 sm:w-1 bg-brand transition-all ${isPlayingAudio ? 'h-3.5 sm:h-4 animate-pulse' : 'h-1'}`} />
                      <span className={`w-0.5 sm:w-1 bg-brand transition-all ${isPlayingAudio ? 'h-2.5 sm:h-3 animate-bounce' : 'h-2'}`} />
                    </div>

                    {/* Volume Slider Control - Compact to prevent any overflow */}
                    <div className="flex items-center space-x-1.5 bg-surface border-2 border-ink px-2 py-1 shrink-0">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="text-ink hover:text-brand cursor-pointer shrink-0"
                        title={isMuted ? (lang === 'id' ? 'Aktifkan Suara' : 'Unmute') : (lang === 'id' ? 'Matikan Suara' : 'Mute')}
                        aria-label="Toggle Mute"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-3.5 h-3.5 text-red-600" />
                        ) : volume < 0.5 ? (
                          <Volume1 className="w-3.5 h-3.5 text-brand" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-brand" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-12 sm:w-16 h-1 sm:h-1.5 accent-brand cursor-pointer shrink-0"
                        title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                        aria-label="Adjust Volume"
                      />
                      <span className="font-mono text-[9px] sm:text-[10px] font-bold text-ink w-6 text-right shrink-0">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Stage with Neo-Brutalist Frame */}
          <div className="lg:col-span-5 relative max-w-full">
            <div className="relative border-4 border-ink bg-white p-4 sm:p-6 aspect-[4/3] sm:aspect-square flex items-center justify-center shadow-[6px_6px_0px_#1A1A1A] sm:shadow-[10px_10px_0px_#1A1A1A] overflow-hidden group max-w-full">
              {/* Product / Asset Image */}
              <img
                src={current.visual.imageUrl}
                alt={current.titleMain}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />

              {/* Rotated Sticker Accent */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-brand text-white border-3 border-ink px-2.5 py-1.5 sm:px-3.5 sm:py-2 shadow-md rotate-sticker-right select-none text-center">
                <div className="font-mono text-[9px] font-bold tracking-widest">{current.visual.badgeTitle}</div>
                <div className="font-display text-lg sm:text-xl leading-none">{current.visual.badgeValue}</div>
              </div>

              {/* Bottom Quick Spec Bar */}
              <div className="absolute bottom-3 left-3 bg-surface border-2 border-ink px-3 py-1 font-mono text-xs font-bold text-ink shadow-xs">
                {current.visual.footerTag}
              </div>
            </div>
          </div>
        </div>

        {/* 4. COMMERCIAL SLIDER NAVIGATION BAR */}
        <div className="mt-8 pt-4 border-t-3 border-ink flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          {/* Direct Slide Category Selectors */}
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto font-bold">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`px-3 py-2 border-2 border-ink text-left transition-all cursor-pointer ${currentSlide === idx
                    ? 'bg-brand text-white shadow-xs -translate-y-0.5'
                    : 'bg-white hover:bg-surface text-ink'
                  }`}
              >
                <div className="text-[10px] opacity-75">0{idx + 1}</div>
                <div className="font-display text-xs truncate">
                  {s.id === 'apparel' ? 'APPAREL DROP' : s.id === 'tour' ? 'TOUR PASSES' : 'VINYL LP'}
                </div>
              </button>
            ))}
          </div>

          {/* Controls: Counter & Arrow Steppers */}
          <div className="flex items-center space-x-3 self-end sm:self-auto">
            {/* Slide Index Counter */}
            <div className="bg-white border-2 border-ink px-3 py-1.5 font-bold text-ink shadow-xs">
              <span className="text-brand font-display text-sm">0{currentSlide + 1}</span>
              <span className="text-ink/40 mx-1">/</span>
              <span>0{slides.length}</span>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center border-2 border-ink bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="p-2 hover:bg-surface border-r-2 border-ink cursor-pointer active:translate-x-0.5 transition-colors"
                title="Previous Slide"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4 text-ink" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="p-2 hover:bg-surface cursor-pointer active:translate-x-0.5 transition-colors"
                title="Next Slide"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4 text-ink" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. HIDDEN HTML5 AUDIO ELEMENT FOR NO-COPYRIGHT RINGTONE */}
      <audio
        ref={audioRef}
        src="/assets/audio/no-copyright-ringtone.mp3"
        loop
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          setIsPlayingAudio(false);
          setCurrentTime(0);
        }}
        onPause={() => setIsPlayingAudio(false)}
        onPlay={() => setIsPlayingAudio(true)}
      />
    </div>
  );
};
