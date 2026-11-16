import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default', // 'default', 'emerald', 'rose', 'blue'
}) => {
  const variantStyles = {
    default: {
      card: 'bg-white border-slate-200/80',
      iconBg: 'bg-slate-100 text-slate-700',
      valColor: 'text-slate-900',
    },
    emerald: {
      card: 'bg-white border-emerald-200/80',
      iconBg: 'bg-emerald-50 text-emerald-600',
      valColor: 'text-emerald-700',
    },
    rose: {
      card: 'bg-white border-rose-200/80',
      iconBg: 'bg-rose-50 text-rose-600',
      valColor: 'text-rose-700',
    },
    blue: {
      card: 'bg-white border-blue-200/80',
      iconBg: 'bg-blue-50 text-blue-600',
      valColor: 'text-blue-700',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`p-5 rounded-2xl border shadow-soft transition-all duration-200 hover:shadow-soft-lg ${style.card}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500 tracking-wide">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold tracking-tight ${style.valColor}`}>{value}</div>
      {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
