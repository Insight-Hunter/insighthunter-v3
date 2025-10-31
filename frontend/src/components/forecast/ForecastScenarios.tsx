// frontend/src/components/forecast/ForecastScenarios.tsx
// Scenario cards for forecast page

import React from 'react';
import '../styles/forecast.css';

interface Scenario {
  type: 'best' | 'base' | 'worst';
  label: string;
  cashFlow: number;
  revenue: number;
  confidence: number;
}

interface Props {
  scenarios: Scenario[];
  activeScenario: string;
  onSelectScenario: (type: string) => void;
}

export const ForecastScenarios: React.FC<Props> = ({ 
  scenarios, 
  activeScenario, 
  onSelectScenario 
}) => {
  const getScenarioColor = (type: string) => {
    switch (type) {
      case 'best': return '#34C759';
      case 'base': return '#007AFF';
      case 'worst': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="forecast-scenarios">
      <h3 className="scenarios-title">Scenarios</h3>
      <div className="scenarios-grid">
        {scenarios.map((scenario) => (
          <button
            key={scenario.type}
            className={`scenario-card ${activeScenario === scenario.type ? 'active' : ''}`}
            onClick={() => onSelectScenario(scenario.type)}
            style={{
              borderColor: activeScenario === scenario.type 
                ? getScenarioColor(scenario.type) 
                : 'transparent'
            }}
          >
            <div className="scenario-header">
              <span className="scenario-label">{scenario.label}</span>
              <span 
                className="scenario-indicator"
                style={{ backgroundColor: getScenarioColor(scenario.type) }}
              />
            </div>
            
            <div className="scenario-metrics">
              <div className="scenario-metric">
                <span className="metric-label">Cash Flow</span>
                <span className="metric-value">
                  {formatCurrency(scenario.cashFlow)}
                </span>
              </div>
              
              <div className="scenario-metric">
                <span className="metric-label">Revenue</span>
                <span className="metric-value">
                  {formatCurrency(scenario.revenue)}
                </span>
              </div>
            </div>
            
            <div className="scenario-confidence">
              <span className="confidence-label">Confidence</span>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ 
                    width: `${scenario.confidence}%`,
                    backgroundColor: getScenarioColor(scenario.type)
                  }}
                />
              </div>
              <span className="confidence-value">{scenario.confidence}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ForecastScenarios;
