import { ChartCard } from '@/components/charts';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { PieChart } from '@/components/charts/PieChart';
import { AreaChart } from '@/components/charts/AreaChart';

/**
 * Analytics Dashboard Page
 * 
 * This page displays various charts and analytics based on system data.
 * Replace the example data below with your actual data from the tables you provide.
 */
export function Analytics() {
  // Example data - Replace with your actual data
  const exampleBarData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 200 },
  ];

  const exampleLineData = [
    { month: 'Jan', students: 400, courses: 240 },
    { month: 'Feb', students: 300, courses: 139 },
    { month: 'Mar', students: 200, courses: 980 },
  ];

  const examplePieData = [
    { name: 'Category A', value: 400 },
    { name: 'Category B', value: 300 },
    { name: 'Category C', value: 200 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">System statistics and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Example Bar Chart */}
        <ChartCard title="Example Bar Chart" description="Replace with your data">
          <BarChart
            data={exampleBarData}
            dataKey="name"
            bars={[
              { dataKey: 'value', name: 'Value', fill: '#0055cc' },
            ]}
            xAxisLabel="Category"
            yAxisLabel="Count"
          />
        </ChartCard>

        {/* Example Line Chart */}
        <ChartCard title="Example Line Chart" description="Replace with your data">
          <LineChart
            data={exampleLineData}
            dataKey="month"
            lines={[
              { dataKey: 'students', name: 'Students' },
              { dataKey: 'courses', name: 'Courses' },
            ]}
            xAxisLabel="Month"
            yAxisLabel="Count"
          />
        </ChartCard>

        {/* Example Pie Chart */}
        <ChartCard title="Example Pie Chart" description="Replace with your data">
          <PieChart data={examplePieData} />
        </ChartCard>

        {/* Example Area Chart */}
        <ChartCard title="Example Area Chart" description="Replace with your data">
          <AreaChart
            data={exampleLineData}
            dataKey="month"
            areas={[
              { dataKey: 'students', name: 'Students' },
              { dataKey: 'courses', name: 'Courses' },
            ]}
            xAxisLabel="Month"
            yAxisLabel="Count"
          />
        </ChartCard>
      </div>
    </div>
  );
}
