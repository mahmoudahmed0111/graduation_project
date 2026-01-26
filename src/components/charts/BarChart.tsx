import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  bars: Array<{
    dataKey: string;
    name: string;
    fill?: string;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
}

export function BarChart({
  data,
  dataKey,
  bars,
  xAxisLabel,
  yAxisLabel,
  height = 300,
}: BarChartProps) {
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
      <RechartsBarChart 
        data={data} 
        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        // Increase gap and limit bar size so columns look slimmer and more readable
        barCategoryGap="40%"
        maxBarSize={32}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey={dataKey}
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
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
        <Legend 
          wrapperStyle={{ fontSize: '12px', marginTop: '16px' }} 
        />
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.fill || colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
            background={{ fill: 'transparent' }}
            activeBar={{ fill: bar.fill || colors[index % colors.length], opacity: 0.8 }}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
