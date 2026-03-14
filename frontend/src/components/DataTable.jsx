import { Table2 } from 'lucide-react';

export default function DataTable({ data, fields }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Table2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No data to display</p>
      </div>
    );
  }

  const columns = fields?.map((f) => f.name) || Object.keys(data[0]);

  const formatCell = (value) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'number') {
      if (Number.isInteger(value)) return value.toLocaleString();
      return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return String(value);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-800/80">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap"
              >
                {col.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="hover:bg-gray-800/30 transition-colors duration-150"
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-4 py-3 text-gray-300 whitespace-nowrap"
                >
                  {formatCell(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
