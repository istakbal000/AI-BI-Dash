import { useState } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
} from 'recharts';

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
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
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

export default function ChartContainer({ chartType, chartData, xAxis, yAxis, title, description }) {
  const [hiddenSeries, setHiddenSeries] = useState({});

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No chart data available
      </div>
    );
  }

  // Determine axes from data if not provided
  const keys = Object.keys(chartData[0]);
  const xKey = xAxis || keys[0];

  // For multi-series, find all numeric keys except xAxis
  const numericKeys = keys.filter((k) => {
    if (k === xKey) return false;
    return chartData.some((row) => typeof row[k] === 'number');
  });
  const yKey = yAxis || numericKeys[0] || keys[1];

  const handleLegendClick = (dataKey) => {
    setHiddenSeries(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey]
    }));
  };

  const legendFormatter = (value, entry) => {
    const key = entry.dataKey || entry.value;
    const isHidden = hiddenSeries[key];
    return (
      <span className={`transition-colors select-none ${isHidden ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
        {value}
      </span>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={xKey} tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top"
                onClick={(e) => handleLegendClick(e.dataKey)} 
                formatter={legendFormatter}
                wrapperStyle={{ cursor: 'pointer', paddingBottom: '15px' }}
              />
              {numericKeys.length > 1
                ? numericKeys.map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      hide={hiddenSeries[key]}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2.5}
                      dot={{ fill: COLORS[i % COLORS.length], r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))
                : <Line
                    type="monotone"
                    dataKey={yKey}
                    hide={hiddenSeries[yKey]}
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6, fill: '#6366f1' }}
                  />
              }
              {chartData.length > 5 && (
                 <Brush dataKey={xKey} height={25} stroke="#6b7280" fill="#1f2937" tickFormatter={() => ''} y={375} />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={xKey} tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top"
                onClick={(e) => handleLegendClick(e.dataKey)} 
                formatter={legendFormatter}
                wrapperStyle={{ cursor: 'pointer', paddingBottom: '15px' }}
              />
              {numericKeys.length > 1
                ? numericKeys.map((key, i) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      hide={hiddenSeries[key]}
                      fill={COLORS[i % COLORS.length]}
                      radius={[6, 6, 0, 0]}
                    />
                  ))
                : <Bar dataKey={yKey} hide={hiddenSeries[yKey]} fill="url(#barGradient)" radius={[6, 6, 0, 0]}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </Bar>
              }
              {chartData.length > 5 && (
                 <Brush dataKey={xKey} height={25} stroke="#6b7280" fill="#1f2937" tickFormatter={() => ''} y={375} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const visiblePieData = chartData.filter(item => !hiddenSeries[item[xKey]]);
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={visiblePieData}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={150}
                innerRadius={60}
                paddingAngle={3}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={{ stroke: '#6b7280' }}
              >
                {visiblePieData.map((entry) => {
                  const originalIndex = chartData.findIndex(d => d[xKey] === entry[xKey]);
                  return <Cell key={entry[xKey]} fill={COLORS[originalIndex % COLORS.length]} />;
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom"
                payload={chartData.map((item, i) => ({
                  id: item[xKey],
                  type: 'square',
                  value: item[xKey],
                  color: COLORS[i % COLORS.length]
                }))}
                onClick={(e) => handleLegendClick(e.value)} 
                formatter={legendFormatter}
                wrapperStyle={{ cursor: 'pointer', paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={xKey} name={xKey} tick={axisStyle} />
              <YAxis dataKey={yKey} name={yKey} tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Legend 
                verticalAlign="top"
                payload={[{ value: yKey, type: 'circle', id: 'ID01', color: '#8b5cf6', dataKey: yKey }]}
                onClick={(e) => handleLegendClick(e.dataKey)}
                formatter={legendFormatter}
                wrapperStyle={{ cursor: 'pointer', paddingBottom: '15px' }}
              />
              {!hiddenSeries[yKey] && (
                <Scatter data={chartData} fill="#8b5cf6" name={yKey}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Scatter>
              )}
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>
      )}
      {renderChart()}
    </div>
  );
}
