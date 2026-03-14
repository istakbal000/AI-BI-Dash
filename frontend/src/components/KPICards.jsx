import { TrendingUp, TrendingDown, DollarSign, Hash, Star, BarChart3 } from 'lucide-react';

const ICONS = {
  revenue: DollarSign,
  price: DollarSign,
  total: DollarSign,
  count: Hash,
  quantity: BarChart3,
  rating: Star,
  average: TrendingUp,
  default: BarChart3,
};

const getIcon = (label) => {
  const lower = label.toLowerCase();
  for (const [key, Icon] of Object.entries(ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return ICONS.default;
};

const formatValue = (value, label) => {
  if (value === null || value === undefined) return 'N/A';

  const num = parseFloat(value);
  if (isNaN(num)) return value;

  const lower = label.toLowerCase();
  if (lower.includes('revenue') || lower.includes('price') || lower.includes('total') || lower.includes('amount')) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  if (lower.includes('rating')) {
    return num.toFixed(2);
  }

  if (num > 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num > 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }

  return num.toLocaleString();
};

export default function KPICards({ kpis }) {
  if (!kpis || kpis.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = getIcon(kpi.label);
        return (
          <div
            key={index}
            className="relative overflow-hidden bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 group hover:border-purple-500/30 transition-all duration-300"
          >
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 opacity-60" />

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400 font-medium">{kpi.label}</span>
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <Icon className="w-4 h-4 text-purple-400" />
              </div>
            </div>

            <p className="text-3xl font-bold text-white tracking-tight">
              {formatValue(kpi.value, kpi.label)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
