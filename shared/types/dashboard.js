// shared/types/dashboard.ts
// Dashboard and KPI Types
export var AlertType;
(function (AlertType) {
    AlertType["CASH_FLOW_WARNING"] = "cash_flow_warning";
    AlertType["REVENUE_DROP"] = "revenue_drop";
    AlertType["EXPENSE_SPIKE"] = "expense_spike";
    AlertType["RUNWAY_LOW"] = "runway_low";
    AlertType["GOAL_ACHIEVED"] = "goal_achieved";
    AlertType["ANOMALY_DETECTED"] = "anomaly_detected";
    AlertType["PAYMENT_DUE"] = "payment_due";
})(AlertType || (AlertType = {}));
export var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["INFO"] = "info";
    AlertSeverity["WARNING"] = "warning";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (AlertSeverity = {}));
