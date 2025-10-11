import React from 'react';
import { Bar } from 'react-chartjs-2';

interface CashFlowChartProps {
  data: any;
  options: any;
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data, options }) => {
  return <Bar data={data} options={options} />;
};

export default CashFlowChart;
