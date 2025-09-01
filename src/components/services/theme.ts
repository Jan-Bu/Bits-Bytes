export type Accent = 'green' | 'pink' | 'blue' | 'purple';

export const accentPresets: Record<
  Accent,
  {
    border: string;
    bgSoft: string;
    text: string;
    shadow: string;
    hoverShadow: string;
    hoverBg: string;
    gradFrom: string;
    gradTo: string;
    gradFromSoft: string;
    dotBg: string;
    dotBgHover50: string;
    ring: string;
    btnSolid: string;
    btnSolidHover: string;
    beforeBgSoft: string;
  }
> = {
  green: {
    border: 'border-green-400',
    bgSoft: 'bg-green-400/5',
    text: 'text-green-400',
    shadow: 'shadow-green-400/10',
    hoverShadow: 'hover:shadow-green-400/25',
    hoverBg: 'hover:bg-green-400/10',
    gradFrom: 'from-green-400',
    gradTo: 'to-blue-400',
    gradFromSoft: 'from-green-400/20',
    dotBg: 'bg-green-400',
    dotBgHover50: 'hover:bg-green-400/50',
    ring: 'border-green-400',
    btnSolid: 'bg-green-400',
    btnSolidHover: 'hover:bg-green-300',
    beforeBgSoft: 'before:bg-green-400/10',
  },
  pink: {
    border: 'border-pink-400',
    bgSoft: 'bg-pink-400/5',
    text: 'text-pink-400',
    shadow: 'shadow-pink-400/10',
    hoverShadow: 'hover:shadow-pink-400/25',
    hoverBg: 'hover:bg-pink-400/10',
    gradFrom: 'from-pink-400',
    gradTo: 'to-purple-400',
    gradFromSoft: 'from-pink-400/20',
    dotBg: 'bg-pink-400',
    dotBgHover50: 'hover:bg-pink-400/50',
    ring: 'border-pink-400',
    btnSolid: 'bg-pink-400',
    btnSolidHover: 'hover:bg-pink-300',
    beforeBgSoft: 'before:bg-pink-400/10',
  },
  blue: {
    border: 'border-blue-400',
    bgSoft: 'bg-blue-400/5',
    text: 'text-blue-400',
    shadow: 'shadow-blue-400/10',
    hoverShadow: 'hover:shadow-blue-400/25',
    hoverBg: 'hover:bg-blue-400/10',
    gradFrom: 'from-blue-400',
    gradTo: 'to-cyan-400',
    gradFromSoft: 'from-blue-400/20',
    dotBg: 'bg-blue-400',
    dotBgHover50: 'hover:bg-blue-400/50',
    ring: 'border-blue-400',
    btnSolid: 'bg-blue-400',
    btnSolidHover: 'hover:bg-blue-300',
    beforeBgSoft: 'before:bg-blue-400/10',
  },
  purple: {
    border: 'border-purple-400',
    bgSoft: 'bg-purple-400/5',
    text: 'text-purple-400',
    shadow: 'shadow-purple-400/10',
    hoverShadow: 'hover:shadow-purple-400/25',
    hoverBg: 'hover:bg-purple-400/10',
    gradFrom: 'from-purple-400',
    gradTo: 'to-fuchsia-400',
    gradFromSoft: 'from-purple-400/20',
    dotBg: 'bg-purple-400',
    dotBgHover50: 'hover:bg-purple-400/50',
    ring: 'border-purple-400',
    btnSolid: 'bg-purple-400',
    btnSolidHover: 'hover:bg-purple-300',
    beforeBgSoft: 'before:bg-purple-400/10',
  },
};
