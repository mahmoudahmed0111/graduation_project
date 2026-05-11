import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        <h1 className="text-3xl font-bold text-gray-900">{t('shared.analytics.title')}</h1>
        <p className="text-gray-600 mt-1">{t('shared.analytics.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Example Bar Chart */}
        <ChartCard title={t('shared.analytics.barTitle')} description={t('shared.analytics.replaceWithData')}>
          <BarChart
            data={exampleBarData}
            dataKey="name"
            bars={[
              { dataKey: 'value', name: t('shared.analytics.value'), fill: '#0055cc' },
            ]}
            xAxisLabel={t('shared.analytics.category')}
            yAxisLabel={t('shared.analytics.count')}
          />
        </ChartCard>

        {/* Example Line Chart */}
        <ChartCard title={t('shared.analytics.lineTitle')} description={t('shared.analytics.replaceWithData')}>
          <LineChart
            data={exampleLineData}
            dataKey="month"
            lines={[
              { dataKey: 'students', name: t('shared.analytics.students') },
              { dataKey: 'courses', name: t('shared.analytics.courses') },
            ]}
            xAxisLabel={t('shared.analytics.month')}
            yAxisLabel={t('shared.analytics.count')}
          />
        </ChartCard>

        {/* Example Pie Chart */}
        <ChartCard title={t('shared.analytics.pieTitle')} description={t('shared.analytics.replaceWithData')}>
          <PieChart data={examplePieData} />
        </ChartCard>

        {/* Example Area Chart */}
        <ChartCard title={t('shared.analytics.areaTitle')} description={t('shared.analytics.replaceWithData')}>
          <AreaChart
            data={exampleLineData}
            dataKey="month"
            areas={[
              { dataKey: 'students', name: t('shared.analytics.students') },
              { dataKey: 'courses', name: t('shared.analytics.courses') },
            ]}
            xAxisLabel={t('shared.analytics.month')}
            yAxisLabel={t('shared.analytics.count')}
          />
        </ChartCard>
      </div>
    </div>
  );
}
