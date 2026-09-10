'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Building2, ShoppingBag, Sparkles } from 'lucide-react'

interface PropertyCard {
  name: string
  logo?: string
  /** fallback initial when no logo */
  initial?: string
  pilar: 'STAY' | 'LIVE' | 'EXPERIENCE'
  /** link to filtered asset list — business_unit name or id */
  filterParam: string
}

const PILAR_META = {
  STAY: {
    label: 'Stay',
    color: 'bg-brand-50 text-brand-600 border-brand-200',
    badgeBg: 'bg-brand-100 text-brand-700',
    icon: <Building2 className="w-3.5 h-3.5" />,
    description: 'Hospitality & Penginapan',
  },
  LIVE: {
    label: 'Live',
    color: 'bg-forest-50 text-forest-500 border-forest-100',
    badgeBg: 'bg-forest-50 text-forest-500',
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
    description: 'Retail & Lifestyle',
  },
  EXPERIENCE: {
    label: 'Experience',
    color: 'bg-heritage-50 text-heritage-500 border-heritage-100',
    badgeBg: 'bg-heritage-50 text-heritage-500',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    description: 'Leisure, Event & Kuliner',
  },
}

const PROPERTIES: PropertyCard[] = [
  // STAY
  { name: 'Royal Ambarrukmo', logo: '/logos/royal-ambarrukmo.webp', pilar: 'STAY', filterParam: 'Royal Ambarrukmo' },
  { name: 'GRAMM Hotel', logo: '/logos/gramm-hotel-black.png', pilar: 'STAY', filterParam: 'GRAMM Hotel' },
  { name: 'PORTA by Ambarrukmo', logo: '/logos/porta.png', pilar: 'STAY', filterParam: 'PORTA' },
  { name: 'Malyabhara', logo: '/logos/malyabhara.svg', pilar: 'STAY', filterParam: 'Malyabhara' },
  // LIVE
  { name: 'Plaza Ambarrukmo', logo: '/logos/plaza-ambarrukmo.png', pilar: 'LIVE', filterParam: 'Plaza Ambarrukmo' },
  { name: 'Plaza Malioboro', logo: '/logos/plaza-malioboro-black.png', pilar: 'LIVE', filterParam: 'Plaza Malioboro' },
  { name: 'VRTX', logo: '/logos/vrtx.png', pilar: 'LIVE', filterParam: 'VRTX' },
  // EXPERIENCE
  { name: 'Pasar Wiguna', initial: 'PW', pilar: 'EXPERIENCE', filterParam: 'Pasar Wiguna' },
  { name: 'Land of Leisures', initial: 'LL', pilar: 'EXPERIENCE', filterParam: 'Land of Leisures' },
  { name: 'The Gateway of Java', initial: 'GJ', pilar: 'EXPERIENCE', filterParam: 'The Gateway of Java' },
  { name: 'Kelana Lidah Jawa', initial: 'KL', pilar: 'EXPERIENCE', filterParam: 'Kelana Lidah Jawa' },
  { name: 'Kelana Swara Ambarrukmo', initial: 'KS', pilar: 'EXPERIENCE', filterParam: 'Kelana Swara' },
  { name: 'Nusantara TV Volcano Run', initial: 'VR', pilar: 'EXPERIENCE', filterParam: 'Volcano Run' },
  { name: 'Land of Beauty', initial: 'LB', pilar: 'EXPERIENCE', filterParam: 'Land of Beauty' },
  { name: 'Tour de Ambarrukmo', initial: 'TA', pilar: 'EXPERIENCE', filterParam: 'Tour de Ambarrukmo' },
]

export default function BusinessUnitGallery() {
  const pilars = ['STAY', 'LIVE', 'EXPERIENCE'] as const

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
            <Image
              src="/logos/ambarrukmo-group.png"
              alt="Ambarrukmo Group"
              width={36}
              height={36}
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 tracking-wide font-serif">
              Portofolio Unit Bisnis
            </h2>
            <p className="text-[11px] text-stone-500 italic">
              Stay, Live, Experience Wholeheartedly
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-7">
        {pilars.map((pilar) => {
          const meta = PILAR_META[pilar]
          const items = PROPERTIES.filter((p) => p.pilar === pilar)

          // Optimize grid columns per pilar for generous card widths
          const gridColsClass =
            pilar === 'EXPERIENCE'
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4'

          return (
            <div key={pilar}>
              {/* Pilar Label */}
              <div className="flex items-center gap-2 mb-3.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${meta.badgeBg}`}>
                  {meta.icon}
                  {meta.label}
                </span>
                <span className="text-xs text-stone-500 font-medium">{meta.description}</span>
                <div className="flex-1 border-t border-stone-200/80" />
              </div>

              {/* Cards Grid */}
              <div className={`grid ${gridColsClass} gap-4`}>
                {items.map((prop) => (
                  <Link
                    key={prop.name}
                    href={`/dashboard/assets?search=${encodeURIComponent(prop.filterParam)}`}
                    className={`group relative flex flex-col items-center justify-between p-4 sm:p-5 rounded-2xl border
                      ${meta.color} bg-white
                      hover:shadow-lg hover:border-brand-400 hover:-translate-y-0.5
                      transition-all duration-200 cursor-pointer min-h-[150px]`}
                  >
                    {/* Logo Container (Significantly enlarged) */}
                    <div className="w-full h-24 sm:h-28 flex items-center justify-center p-3 rounded-xl bg-stone-50/80 border border-stone-200/60 group-hover:bg-brand-50/50 group-hover:border-brand-200 transition-all mb-3">
                      {prop.logo ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <Image
                            src={prop.logo}
                            alt={prop.name}
                            width={260}
                            height={120}
                            className="max-h-16 sm:max-h-20 w-auto max-w-[90%] object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-brand-100 via-brand-50 to-stone-100 border border-brand-200/80 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <span className="text-brand-700 font-bold text-lg font-serif tracking-wider">
                            {prop.initial}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Name & Action Hint */}
                    <div className="text-center w-full mt-auto">
                      <span className="text-xs sm:text-sm font-bold text-stone-800 text-center leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors block">
                        {prop.name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium mt-0.5 block group-hover:text-brand-600 transition-colors">
                        Lihat Aset →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
