import React from 'react';
import { Check, Palette, Sparkles } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ThemeId } from '../../types';

interface ThemeOption {
  id: ThemeId;
  name: string;
  nameEn: string;
  description: string;
  colors: {
    bg: string;
    surface: string;
    accent: string;
  };
}

const THEMES: ThemeOption[] = [
  {
    id: 'executive-gold',
    name: 'الذهب التنفيذي',
    nameEn: 'Executive Gold',
    description: 'فحم غير لامع مع لمسات ذهبية دافئة وفخامة تنفيذية رفيعة.',
    colors: {
      bg: '#080809',
      surface: '#111215',
      accent: '#eab308'
    }
  },
  {
    id: 'midnight-blue',
    name: 'أزرق منتصف الليل',
    nameEn: 'Midnight Blue',
    description: 'كحلي عميق وجرافيت تقني مع تباين أزرق جليدي حديث.',
    colors: {
      bg: '#050a14',
      surface: '#0b1528',
      accent: '#38bdf8'
    }
  },
  {
    id: 'graphite',
    name: 'الجرافيت الصامت',
    nameEn: 'Graphite Studio',
    description: 'رمادي حجري هادئ وبسيط مستوحى من أنظمة التصميم العالمية.',
    colors: {
      bg: '#0c0d0e',
      surface: '#16181b',
      accent: '#f8fafc'
    }
  },
  {
    id: 'warm-stone',
    name: 'الحجر الدافئ',
    nameEn: 'Warm Stone',
    description: 'درجات بنية وترابية مع لمسات برونزية راقية ومريحة للعين.',
    colors: {
      bg: '#0c0a09',
      surface: '#171412',
      accent: '#d97706'
    }
  }
];

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useCompany();

  return (
    <div className="space-y-3 text-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[var(--accent-primary)]" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">سمة نظام التشغيل (Visual Theme)</h3>
        </div>
        <span className="text-xs text-[var(--text-secondary)] font-mono">4 سمات تنفيذية</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {THEMES.map((th) => {
          const isSelected = theme === th.id;
          return (
            <button
              key={th.id}
              onClick={() => setTheme(th.id)}
              className={`relative p-4 rounded-2xl border text-right transition-all group overflow-hidden ${
                isSelected
                  ? 'border-[var(--border-accent)] bg-[var(--bg-surface)] shadow-lg ring-1 ring-[var(--accent-primary)]/20'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-accent)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              {/* Theme color swatch preview */}
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-5 h-5 rounded-full border border-white/20 shadow-inner" 
                  style={{ backgroundColor: th.colors.bg }}
                />
                <div 
                  className="w-5 h-5 rounded-full border border-white/20 shadow-inner" 
                  style={{ backgroundColor: th.colors.surface }}
                />
                <div 
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm" 
                  style={{ backgroundColor: th.colors.accent }}
                />

                {isSelected && (
                  <span className="mr-auto flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-primary)] text-white shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="font-bold text-xs text-[var(--text-primary)] flex items-center justify-between">
                  <span>{th.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">{th.nameEn}</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {th.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
