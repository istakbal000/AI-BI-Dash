import ChartContainer from './ChartContainer';
import KPICards from './KPICards';
import DataTable from './DataTable';
import { Code, BarChart3, Clock, Database } from 'lucide-react';

export default function Dashboard({ result }) {
  if (!result) return null;

  const {
    query,
    sql,
    chartType,
    chartReason,
    xAxis,
    yAxis,
    title,
    description,
    chartData,
    kpis,
    rowCount,
    fields,
    timestamp,
  } = result;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Query Info Bar */}
      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-500/10 rounded-xl shrink-0 mt-0.5">
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium">{query}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
              {timestamp && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timestamp}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                {rowCount} rows
              </span>
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full">
                {chartType}
              </span>
            </div>
          </div>
        </div>

        {/* SQL Preview */}
        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1.5 transition-colors">
            <Code className="w-3.5 h-3.5" />
            View Generated SQL
          </summary>
          <pre className="mt-2 p-4 bg-gray-950/80 rounded-xl text-xs text-green-400 overflow-x-auto border border-gray-800/50 font-mono">
            {sql}
          </pre>
        </details>
      </div>

      {/* KPI Cards */}
      {kpis && kpis.length > 0 && <KPICards kpis={kpis} />}

      {/* Chart */}
      {chartType !== 'table' && chartType !== 'kpi' && (
        <ChartContainer
          chartType={chartType}
          chartData={chartData}
          xAxis={xAxis}
          yAxis={yAxis}
          title={title}
          description={description}
        />
      )}

      {/* Data Table */}
      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Preview</h3>
        <DataTable data={chartData?.slice(0, 50)} fields={fields} />
      </div>
    </div>
  );
}
