import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AreaChartProps {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  areas: Array<{
    dataKey: string;
    name: string;
    fill?: string;
    stroke?: string;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
}

export function AreaChart({
  data,
  dataKey,
  areas,
  xAxisLabel,
  yAxisLabel,
  height = 300,
}: AreaChartProps) {
  const colors = [
    '#0055cc', // primary-500
    '#ffd700', // accent-500
    '#10b981', // green-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // purple-500
    '#06b6d4', // cyan-500
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          {areas.map((area, index) => (
            <linearGradient key={area.dataKey} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.fill || colors[index % colors.length]} stopOpacity={0.8} />
              <stop offset="95%" stopColor={area.fill || colors[index % colors.length]} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey={dataKey}
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stroke={area.stroke || colors[index % colors.length]}
            fill={`url(#color${index})`}
            strokeWidth={2}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
