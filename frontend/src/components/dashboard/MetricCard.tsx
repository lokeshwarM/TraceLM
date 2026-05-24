import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="bg-[#161921] border border-gray-800/60 rounded-2xl p-6 shadow-lg flex flex-col justify-between transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gray-400 text-sm font-medium tracking-wide uppercase">{title}</h3>
        <div className="text-blue-400 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white tracking-tight">
        {value}
      </div>
    </div>
  );
}
