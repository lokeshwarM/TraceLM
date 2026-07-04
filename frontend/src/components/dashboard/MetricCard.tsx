import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-muted-text text-xs font-semibold tracking-wider uppercase">{title}</h3>
        <div className="text-primary bg-primary-glow p-2.5 rounded-xl border border-primary/20">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground tracking-tight">
        {value}
      </div>
    </div>
  );
}
