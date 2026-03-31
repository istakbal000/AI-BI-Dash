import { useState, useEffect } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush,
  ZAxis
} from 'recharts';
import { 
  LineChart as LineIcon, 
  BarChart2 as BarIcon, 
  PieChart as PieIcon, 
  Projector as ScatterIcon, 
  Table as TableIcon,
  Layers as HeatmapIcon,
  Maximize2 as KPIIcon,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const COLORS = [
  '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6',
  '#10b981', '#22c55e', '#eab308', '#f97316', '#ef4444',
  '#ec4899', '#a855f7',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-gray-400 text-xs mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || '#fff' }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

const axisStyle = {
  fontSize: 12,
  fill: '#9ca3af',
};

const CHART_TYPES = [
  { id: 'line', icon: LineIcon, label: 'Line' },
  { id: 'bar', icon: BarIcon, label: 'Bar' },
  { id: 'pie', icon: PieIcon, label: 'Pie' },
  { id: 'scatter', icon: ScatterIcon, label: 'Scatter' },
  { id: 'heatmap', icon: HeatmapIcon, label: 'Heatmap' },
  { id: 'kpi', icon: KPIIcon, label: 'KPI' },
];

export default function ChartContainer({ chartType, chartData, xAxis, yAxis, zAxis, title, description }) {
  const [localChartType, setLocalChartType] = useState(chartType || 'bar');
  const [hiddenSeries, setHiddenSeries] = useState({});

  // Sync local type with prop when new query arrives
  useEffect(() => {
    if (chartType) {
      setLocalChartType(chartType);
    }
  }, [chartType, chartData]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No chart data available
      </div>
    );
  }

  // Determine axes from data with better matching (case-insensitive)
  const keys = Object.keys(chartData[0]);
  
  const findKey = (suggested) => {
    if (!suggested) return null;
    return keys.find(k => k.toLowerCase() === suggested.toLowerCase());
  };

  // 1. Try to find keys suggested by AI
  let xKey = findKey(xAxis);
  let yKey = findKey(yAxis);
  let zKey = findKey(zAxis);

  // 2. Identify numeric and categorical keys
  const numericKeys = keys.filter(k => chartData.some(row => typeof row[k] === 'number'));
  const categoryKeys = keys.filter(k => !numericKeys.includes(k));

  // 3. Fallback logic
  if (!xKey) xKey = keys[0];
  if (!yKey) yKey = numericKeys.find(k => k !== xKey) || keys[1];
  if (!zKey) zKey = numericKeys.find(k => k !== xKey && k !== yKey) || yKey;

  // Filter numeric keys for multi-series
  const seriesKeys = numericKeys.filter(k => k !== xKey);

  // Sorting
  const sortedData = [...chartData].sort((a, b) => {
    const valA = a[xKey];
    const valB = b[xKey];
    if (typeof valA === 'number' && typeof valB === 'number') return valA - valB;
    if (typeof valA === 'string' && typeof valB === 'string') {
      const dateA = Date.parse(valA);
      const dateB = Date.parse(valB);
      if (!isNaN(dateA) && !isNaN(dateB)) return dateA - dateB;
      return valA.localeCompare(valB);
    }
    return 0;
  });

  const formatXAxis = (tick) => {
    if (typeof tick === 'string' && tick.length > 20) {
      return tick.substring(0, 10) + '...';
    }
    return tick;
  };

  const normalizedType = String(localChartType || '').toLowerCase().trim();

  const renderChart = () => {
    switch (normalizedType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={xKey} tick={axisStyle} tickFormatter={formatXAxis} minTickGap={30} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36}/>
              {seriesKeys.length > 1
                ? seriesKeys.map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))
                : <Line
                    type="monotone"
                    dataKey={yKey}
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                    isAnimationActive={false}
                  />
              }
              <Brush dataKey={xKey} height={30} stroke="#6b7280" fill="#111827" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={xKey} tick={axisStyle} tickFormatter={formatXAxis} minTickGap={30} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36}/>
              {seriesKeys.length > 1
                ? seriesKeys.map((key, i) => (
                    <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                  ))
                : <Bar dataKey={yKey} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              }
              <Brush dataKey={xKey} height={30} stroke="#6b7280" fill="#111827" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={150}
                innerRadius={60}
                paddingAngle={5}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={xKey} name={xKey} tick={axisStyle} />
              <YAxis dataKey={yKey} name={yKey} tick={axisStyle} />
              <ZAxis dataKey={zKey} range={[64, 1000]} name={zKey} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Legend verticalAlign="top" height={36} />
              <Scatter name="Data Summary" data={chartData} fill="#8b5cf6">
                 {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'heatmap':
        // For heatmap, we expect xKey, yKey (categories) and zKey (numeric)
        // If yKey is numeric, we try to find another category
        const hXKey = xKey;
        const hYKey = categoryKeys.find(k => k !== hXKey) || keys[1];
        const hValKey = zKey || numericKeys[0] || keys[2];

        const maxVal = Math.max(...chartData.map(d => Number(d[hValKey]) || 0));
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <XAxis 
                type="category" 
                dataKey={hXKey} 
                name={hXKey} 
                tick={axisStyle} 
                interval={0}
              />
              <YAxis 
                type="category" 
                dataKey={hYKey} 
                name={hYKey} 
                tick={axisStyle} 
                interval={0}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name={hValKey} data={chartData}>
                {chartData.map((entry, index) => {
                  const val = Number(entry[hValKey]) || 0;
                  const ratio = maxVal > 0 ? val / maxVal : 0;
                  // Color interpolation from gray to purple
                  const r = Math.round(31 + (139 - 31) * ratio);
                  const g = Math.round(41 + (92 - 41) * ratio);
                  const b = Math.round(55 + (246 - 55) * ratio);
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`rgb(${r}, ${g}, ${b})`}
                      stroke="none"
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'kpi':
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {typeof sortedData[0][yKey] === 'number' ? sortedData[0][yKey].toLocaleString() : sortedData[0][yKey]}
            </h2>
            <p className="text-gray-400 mt-2 text-lg uppercase tracking-wider">{yKey}</p>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Unsupported chart type: {normalizedType}
          </div>
        );
    }
  };

  return (
    <div className="group relative bg-[#0d1117] border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:border-purple-500/30 shadow-xl overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/5 blur-[100px] pointer-events-none group-hover:bg-purple-600/10 transition-all duration-500" />
      
      {/* Header & Conversion Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            {title || 'Data Visualization'}
          </h3>
          {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>

        {/* Chart Conversion Toolbar */}
        <div className="flex items-center gap-1 bg-gray-900/50 p-1.5 rounded-xl border border-gray-800 backdrop-blur-sm self-start">
          {CHART_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setLocalChartType(type.id)}
              className={`p-2 rounded-lg transition-all duration-200 group/btn relative ${
                normalizedType === type.id 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                  : 'text-gray-500 hover:text-purple-400 hover:bg-purple-500/10'
              }`}
              title={type.label}
            >
              <type.icon size={18} />
              {/* Tooltip on hover */}
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-gray-700 z-50">
                {type.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative min-h-[400px]">
        {renderChart()}
      </div>

      {/* Footer Details */}
      <div className="mt-6 pt-4 border-t border-gray-800/50 flex items-center justify-between text-[11px] text-gray-500 uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span>X: <span className="text-purple-400/80">{xKey}</span></span>
          <span>Y: <span className="text-blue-400/80">{yKey}</span></span>
          {normalizedType === 'heatmap' && (
            <span>Z: <span className="text-emerald-400/80">{zKey || 'Value'}</span></span>
          )}
        </div>
        <div>
          {sortedData.length} Data Points
        </div>
      </div>
    </div>
  );
}
