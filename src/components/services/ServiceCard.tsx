import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Accent, accentPresets } from './theme';

type Item = { title: string; note?: string; href?: string };

type Props = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  features: string[];
  items?: Item[];
  accent?: Accent;
  learnMoreLabel?: string;
  onLearnMoreClick?: () => void;
};

const ServiceCard: React.FC<Props> = ({
  icon: Icon, title, description, features, items, accent = 'green', learnMoreLabel, onLearnMoreClick,
}) => {
  const a = accentPresets[accent];

  return (
    <div className="group relative h-full flex flex-col">
      <div className={['relative bg-gray-900 border-2', a.border, a.bgSoft, 'p-6 transform transition-all duration-300 hover:scale-105 shadow-lg', a.hoverShadow, 'flex flex-col h-full'].join(' ')}>
        <div className="flex items-center gap-4 mb-4">
          <div className={['p-3 border-2', a.border, a.bgSoft, a.text].join(' ')}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold tracking-wider text-white font-jersey">{title}</h3>
        </div>

        <p className="text-gray-300 mb-6 leading-relaxed">{description}</p>

        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map((f, i) => (
              <div key={i} className={['text-sm font-mono', a.text, a.bgSoft, a.border, 'p-4 border text-center'].join(' ')}>{f}</div>
            ))}
          </div>

          {!!items?.length && (
            <div className="space-y-2 mb-6">
              {items.map((it, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-800 border border-gray-700">
                  <span className="text-white font-mono text-sm">{it.title}</span>
                  <div className="flex items-center gap-2">
                    {it.note && <span className={['text-xs font-bold', a.text].join(' ')}>{it.note}</span>}
                    {it.href && <ExternalLink className={['w-4 h-4', a.text].join(' ')} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {learnMoreLabel && (
          <button
            onClick={onLearnMoreClick}
            className={['w-full py-3 border-2', a.border, a.text, a.bgSoft, 'font-mono font-bold', a.btnSolidHover, 'transition-all duration-300 transform hover:scale-105 active:scale-95', 'mt-auto'].join(' ')}
          >
            {learnMoreLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
