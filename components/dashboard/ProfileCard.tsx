'use client'

import { QRCodeSVG } from 'qrcode.react'
import type { ProfileData, ThemeColor, Gender } from '@/lib/types'
import { COLORS } from '@/lib/types'
import { AlertTriangle, Fingerprint, Sparkles, Quote, Hash, ArrowUpRight } from 'lucide-react'

interface ProfileCardProps {
  data: ProfileData
  shareUrl: string
  forwardRef?: React.Ref<HTMLDivElement>
}

const GenderIndicator: React.FC<{ gender: Gender; target: Gender }> = ({ gender, target }) => {
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase bg-black/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10 text-white/90 shadow-sm whitespace-nowrap">
      <span>{gender === 'Male' ? 'BOY' : gender === 'Female' ? 'GIRL' : 'NB'}</span>
      <span className="opacity-50">→</span>
      <span>{target === 'Male' ? 'BOY' : target === 'Female' ? 'GIRL' : 'ANY'}</span>
    </div>
  )
}

export function ProfileCard({ data, shareUrl, forwardRef }: ProfileCardProps) {
  const themeClass = COLORS[data.themeColor as ThemeColor] || COLORS.zinc
  const isQrSafe = shareUrl.length < 4000

  return (
    <div
      ref={forwardRef}
      className={`w-full max-w-[520px] shadow-2xl mx-auto flex flex-col relative ${themeClass} min-h-[600px] h-auto overflow-hidden rounded-[24px]`}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none z-10 rounded-[24px]" />

      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10 rounded-[24px]" />

      {/* Content Container */}
      <div className="relative z-20 flex flex-col h-full text-white">
        {/* Top Header */}
        <div className="p-6 md:p-8 pb-4">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-[0.25em] uppercase opacity-70 mb-1.5">
                SoulSync Pass
              </span>
              <div className="w-8 h-1 bg-white/50 rounded-full" />
            </div>
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm shadow-inner">
              <Sparkles size={18} className="text-white opacity-90" />
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] mb-4 break-words drop-shadow-xl">
              {data.nickname || 'Unknown'}
            </h1>
            <p className="text-lg font-medium opacity-90 flex items-center gap-2">{data.title}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <GenderIndicator gender={data.gender} target={data.targetGender} />
            {data.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-bold px-2 py-1 bg-white/95 text-black rounded shadow-sm flex items-center gap-1 backdrop-blur-sm whitespace-nowrap"
              >
                <Hash size={8} /> {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Middle Content Area */}
        <div className="flex-1 px-6 md:px-8 py-6 flex flex-col gap-6">
          {/* About Block */}
          <div className="relative">
            <div className="absolute -left-4 top-0 text-white/10">
              <Quote size={40} className="transform -scale-x-100" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3 pl-1 border-l-2 border-white/30 ml-[-4px]">
              About Me
            </h3>
            <div className="space-y-2 relative z-10">
              {data.aboutMe.map((line, i) => (
                <p key={i} className="text-sm font-medium leading-relaxed opacity-95 drop-shadow-md">
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Looking For Block */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3 pl-1 border-l-2 border-white/30 ml-[-4px]">
              Seeking
            </h3>
            <div className="space-y-2">
              {data.lookingFor.map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <ArrowUpRight size={14} className="mt-1 opacity-70 shrink-0" />
                  <p className="text-sm font-medium leading-relaxed opacity-95">{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Ticket Stub */}
        <div className="mt-auto bg-white text-zinc-900 p-6 pt-8 rounded-b-[24px] relative shadow-2xl">
          {/* Cutout circles */}
          <div className="absolute top-0 left-[-10px] w-6 h-6 bg-transparent rounded-full shadow-[inset_-10px_0_0_0_#000] opacity-20 transform -translate-y-1/2" />

          <div className="flex justify-between items-end">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Fingerprint size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Connect ID</span>
              </div>

              {/* Distinct Gender Line */}
              <div className="inline-flex items-center gap-1.5 bg-zinc-100 px-2 py-1 rounded-md text-[11px] font-bold text-zinc-800 mb-3 border border-zinc-200">
                <span>{data.gender}</span>
                <span className="text-zinc-400 px-1">→</span>
                <span>{data.targetGender}</span>
              </div>

              <div className="text-xl font-black tracking-tighter leading-none mb-3">
                SCAN TO
                <br />
                APPLY
              </div>
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed max-w-[140px]">
                Answer {data.questions.length} questions to unlock contact details.
              </p>
            </div>

            <div className="shrink-0 p-1.5 bg-white border-2 border-zinc-900 rounded-xl relative shadow-lg">
              {isQrSafe ? (
                <QRCodeSVG
                  value={shareUrl}
                  size={76}
                  level="L"
                  fgColor="#000000"
                  bgColor="#ffffff"
                  className="rounded-lg"
                />
              ) : (
                <div className="w-[76px] h-[76px] flex flex-col items-center justify-center bg-zinc-100 text-red-500 rounded-lg">
                  <AlertTriangle size={24} />
                  <span className="text-[8px] font-bold mt-1">LIMIT</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
