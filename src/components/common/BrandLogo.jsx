import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export function BrandLogo({ 
  size = 36, 
  showText = true, 
  variant = 'icon', // 'icon' | 'full'
  className = '',
  imgClassName = '',
  textClassName = '',
  onClick
}) {
  let theme = 'dark';
  try {
    const themeCtx = useTheme();
    theme = themeCtx?.theme || 'dark';
  } catch (e) {
    if (typeof document !== 'undefined') {
      theme = document.documentElement.getAttribute('data-theme') || 'dark';
    }
  }

  const isDark = theme === 'dark';

  if (variant === 'full') {
    const fullLogoSrc = isDark ? '/logo-dark.png' : '/logo-light.png';
    return (
      <div 
        className={`flex items-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
      >
        <img 
          src={fullLogoSrc} 
          alt="SkillBridge Logo" 
          style={{ height: `${size}px`, width: 'auto' }}
          className={`object-contain transition-all duration-200 ${imgClassName}`}
        />
      </div>
    );
  }

  const iconSrc = isDark ? '/logo-icon-dark.png' : '/logo-icon-light.png';

  return (
    <div 
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div 
        style={{ width: `${size}px`, height: `${size}px` }} 
        className="relative shrink-0 rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-105 border border-primary/20"
      >
        <img 
          src={iconSrc} 
          alt="SkillBridge" 
          className={`w-full h-full object-cover ${imgClassName}`}
        />
      </div>
      {showText && (
        <span className={`font-bold tracking-tight text-foreground transition-colors ${textClassName}`}>
          SkillBridge
        </span>
      )}
    </div>
  );
}

export default BrandLogo;
