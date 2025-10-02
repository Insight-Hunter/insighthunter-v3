import React from 'react';
import { Line } from 'react-chartjs-2';

interface ProfitMarginChartProps {
  data: any;
  options: any;
}

const ProfitMarginChart: React.FC<ProfitMarginChartProps> = ({ data, options }) => {
  return <Line data={data} options={options} />;
};

export default ProfitMarginChart;
