// shared/types/forecast.ts
// Forecasting and Scenario Types
export var ForecastType;
(function (ForecastType) {
    ForecastType["CASH_FLOW"] = "cash_flow";
    ForecastType["REVENUE"] = "revenue";
    ForecastType["EXPENSES"] = "expenses";
    ForecastType["PROFIT"] = "profit";
})(ForecastType || (ForecastType = {}));
export var ScenarioType;
(function (ScenarioType) {
    ScenarioType["BEST"] = "best";
    ScenarioType["BASE"] = "base";
    ScenarioType["WORST"] = "worst";
    ScenarioType["CUSTOM"] = "custom";
})(ScenarioType || (ScenarioType = {}));
