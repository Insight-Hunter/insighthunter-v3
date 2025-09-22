import React from 'react';
import { Line } from 'react-chartjs-2';

interface RevenueExpensesChartProps {
  data:  any  ;
  options:  any  ;
}

const RevenueExpensesChart: React.FC<RevenueExpensesChartProps> = ({ data, options }) => {
  return <Line data={data} options={options} />;
};

export default RevenueExpensesChart;
