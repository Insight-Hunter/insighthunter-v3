import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import './App.css';
import { useState } from 'react';

import RevenueExpensesChart from '../components/RevenueExpensesChart';
import CashFlowChart from '../components/CashFlowChart';
import ProfitMarginChart from "../components/ProfitMarginChart";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

// Sample app data (abbreviated for brevity)
const financialData = [
  { month: "2024-01", revenue: 42483.57, cogs: 17477.35, gross_profit: 25006.22, operating_expenses: 23366.85, marketing_expenses: 4457.22, net_income: -2817.85, cash_flow: -2130.62 },
  { month: "2024-02", revenue: 44308.68, cogs: 13896.91, gross_profit: 30411.77, operating_expenses: 25332.77, marketing_expenses: 2471.20, net_income: 2607.80, cash_flow: -918.28 },
  { month: "2024-03", revenue: 58238.44, cogs: 19845.54, gross_profit: 38392.90, operating_expenses: 21547.02, marketing_expenses: 4495.66, net_income: 12350.22, cash_flow: 12998.39},
  { month: "2024-04", revenue: 67615.15, cogs: 25921.48, gross_profit: 41693.67, operating_expenses: 26127.09, marketing_expenses: 6958.38, net_income: 8608.19, cash_flow: 7838.03},
  { month: "2024-05", revenue: 48829.23, cogs: 17506.03, gross_profit: 31323.20, operating_expenses: 23198.08, marketing_expenses: 5621.39, net_income: 2503.73, cash_flow: 1149.88},
  { month: "2024-06", revenue: 45678.90, cogs: 16234.56, gross_profit: 29444.34, operating_expenses: 24567.89, marketing_expenses: 4234.67, net_income: 641.78, cash_flow: 1892.45},
  { month: "2024-07", revenue: 41234.56, cogs: 15678.23, gross_profit: 25556.33, operating_expenses: 25123.45, marketing_expenses: 3789.12, net_income: -3356.24, cash_flow: -2145.78},
  { month: "2024-08", revenue: 43567.89, cogs: 16789.34, gross_profit: 26778.55, operating_expenses: 24890.12, marketing_expenses: 4123.56, net_income: -2235.13, cash_flow: -1567.89},
  { month: "2024-09", revenue: 59876.54, cogs: 21234.56, gross_profit: 38641.98, operating_expenses: 23456.78, marketing_expenses: 5432.10, net_income: 9753.10, cash_flow: 10234.56},
  { month: "2024-10", revenue: 72345.67, cogs: 27890.12, gross_profit: 44455.55, operating_expenses: 25678.90, marketing_expenses: 6789.12, net_income: 11987.53, cash_flow: 12456.78},
  { month: "2024-11", revenue: 78901.23, cogs: 29876.54, gross_profit: 49024.69, operating_expenses: 26789.01, marketing_expenses: 7234.56, net_income: 15001.12, cash_flow: 14567.89},
  { month: "2024-12", revenue: 69876.54, cogs: 25432.10, gross_profit: 44444.44, operating_expenses: 27123.45, marketing_expenses: 6543.21, net_income: 10777.78, cash_flow: 11234.56}
  
];
const kpis = {
  revenue_growth: 15.2,
  gross_margin: 58.3,
  operating_margin: 12.5,
  cash_ratio: 2.1,
  customer_acquisition_cost: 850,
  lifetime_value: 4200,
  monthly_recurring_revenue: 48500,
  burn_rate: 22000,
  runway_months: 18,
  debt_to_equity: 0.65,
};

type AlertPriority = "high" | "medium" | "low";

const alerts = [
  { id: 1, type: "warning", title: "Cash Flow Alert", message: "Cash flow projection shows potential shortage in Q2 2025", priority: "high" as AlertPriority, date: "2024-12-20T10:30:00Z" },
  { id: 2, type: "info", title: "Revenue Growth", message: "Monthly revenue exceeded target by 8%", priority: "medium" as AlertPriority, date: "2024-12-18T14:15:00Z" },
  { id: 3, type: "success", title: "Cost Optimization", message: "Operating expenses reduced by 5% compared to last quarter", priority: "low" as AlertPriority, date: "2024-12-15T09:45:00Z" }
];

const customers = [
  { id: "CUST_001", name: "TechCorp Inc", monthly_value: 4500.50, lifetime_value: 18200.75, status: "active" },
  { id: "CUST_002", name: "Digital Solutions LLC", monthly_value: 3200.25, lifetime_value: 12800.99, status: "active" },
  // ... more customers
];

// Utility to format currency
const formatCurrency = (val: number) =>
  "$" + val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// Priority color mapping for alerts
const priorityColors: Record<AlertPriority, string> = {
  high: '#c0152f',
  medium: '#e69361',
  low: '#229556'
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data for charts
  const months = financialData.map(d => d.month);
  const revenue = financialData.map(d => d.revenue);
  const expenses = financialData.map(d => d.operating_expenses + d.marketing_expenses + d.cogs);
  const profitMargins = financialData.map(d => Number(((d.gross_profit / d.revenue) * 100).toFixed(2)));
  const cashFlows = financialData.map(d => d.cash_flow);

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const } // must be a string literal, not a variable string
    }
  };

  const revenueExpensesData = {
    labels: months,
    datasets: [
      {
        label: 'Revenue',
         revenue,
        borderColor: 'rgba(50,184,198,1)',
        backgroundColor: 'rgba(50,184,198,0.25)',
        fill: true,
        tension: 0.2,
        yAxisID: 'y'
      },
      {
        label: 'Expenses',
         expenses,
        borderColor: 'rgba(192,21,47,1)',
        backgroundColor: 'rgba(192,21,47,0.25)',
        fill: true,
        tension: 0.2,
        yAxisID: 'y'
      }
    ]
  };

  const profitMarginData = {
    labels: months,
    datasets: [
      {
        label: 'Gross Margin %',
         profitMargins,
        borderColor: 'rgba(33,128,141,1)',
        backgroundColor: 'rgba(33,128,141,0.3)',
        fill: true,
        tension: 0.3,
        yAxisID: 'y'
      }
    ]
  };

  const cashFlowData = {
    labels: months,
    datasets: [
      {
        label: 'Cash Flow',
         cashFlows,
        backgroundColor: cashFlows.map(val => val >= 0 ? 'rgba(33,128,141,0.7)' : 'rgba(192,21,47,0.7)')
      }
    ]
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <i className="fas fa-chart-line"></i>
          <h1>Insight Hunter</h1>
        </div>
        <nav className="nav-tabs">
          {['dashboard', 'reports', 'analytics', 'alerts', 'settings'].map(tab => (
            <button
              key={tab}
              className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <i className={`fas fa-${tab === 'dashboard' ? 'tachometer-alt' : tab === 'reports' ? 'file-alt' : tab === 'analytics' ? 'chart-bar' : tab === 'alerts' ? 'bell' : 'cog'}`}></i>{' '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>Quick Access</h3>
            <div className="quick-stats">
              <div className="quick-stat">
                <span className="stat-label">Revenue This Month</span>
                <span className="stat-value">{formatCurrency(revenue[revenue.length-1])}</span>
              </div>
              <div className="quick-stat">
                <span className="stat-label">Net Income Last Month</span>
                <span className="stat-value">{formatCurrency(financialData[financialData.length-2].net_income)}</span>
              </div>
              <div className="quick-stat">
                <span className="stat-label">Cash Flow</span>
                <span className="stat-value">{formatCurrency(financialData[financialData.length-1].cash_flow)}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-content">
          {activeTab === 'dashboard' && (
            <>
              <div className="kpi-cards">
                <div className="kpi-card">
                  <h4>Revenue Growth</h4>
                  <p>{kpis.revenue_growth}%</p>
                </div>
                <div className="kpi-card">
                  <h4>Gross Margin</h4>
                  <p>{kpis.gross_margin}%</p>
                </div>
                <div className="kpi-card">
                  <h4>Cash Ratio</h4>
                  <p>{kpis.cash_ratio}</p>
                </div>
                <div className="kpi-card">
                  <h4>Monthly Recurring Revenue</h4>
                  <p>{formatCurrency(kpis.monthly_recurring_revenue)}</p>
                </div>
              </div>
              <div className="charts-row">
               <RevenueExpensesChart data={revenueExpensesData} options={commonOptions} />
               <ProfitMarginChart data={profitMarginData} options={commonOptions} />
               <CashFlowChart data={cashFlowData} options={{ ...commonOptions, plugins: { legend: { display: false } }}} />
              </div>
              
                <div className="customers-table-container">
                  <h3>Top Customers</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Monthly Value</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(c => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td>{formatCurrency(c.monthly_value)}</td>
                          <td className={c.status === 'active' ? 'status-active' : c.status === 'churned' ? 'status-churned' : 'status-at_risk'}>
                            {c.status.replace('_', ' ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              
            </>
          )}

          {activeTab === 'reports' && (<h2>Reports <br /><em>Coming Soon</em></h2>)}
          {activeTab === 'analytics' && (<h2>Analytics <br /><em>Coming Soon</em></h2>)}
          {activeTab === 'alerts' && (
            <>
              <h2>Alerts</h2>
              <ul>
                {alerts.map(a => (
                  <li key={a.id} style={{ backgroundColor: priorityColors[a.priority], color: '#fff', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                    <strong>{a.title}</strong><br />
                    <small>{new Date(a.date).toLocaleString()}</small>
                    <p>{a.message}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
          {activeTab === 'settings' && (<h2>Settings <br /><em>Coming Soon</em></h2>)}
        </main>
      </div>
    </div>
  );
}

export default App;
