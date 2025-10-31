// shared/types/reports.ts
// Financial Reports Types
export var ReportType;
(function (ReportType) {
    ReportType["PROFIT_LOSS"] = "profit_loss";
    ReportType["BALANCE_SHEET"] = "balance_sheet";
    ReportType["CASH_FLOW_STATEMENT"] = "cash_flow_statement";
    ReportType["KPI_DASHBOARD"] = "kpi_dashboard";
    ReportType["CUSTOM"] = "custom";
})(ReportType || (ReportType = {}));
export var ReportPeriod;
(function (ReportPeriod) {
    ReportPeriod["DAILY"] = "daily";
    ReportPeriod["WEEKLY"] = "weekly";
    ReportPeriod["MONTHLY"] = "monthly";
    ReportPeriod["QUARTERLY"] = "quarterly";
    ReportPeriod["YEARLY"] = "yearly";
    ReportPeriod["CUSTOM"] = "custom";
})(ReportPeriod || (ReportPeriod = {}));
export var ReportFormat;
(function (ReportFormat) {
    ReportFormat["PDF"] = "pdf";
    ReportFormat["EXCEL"] = "excel";
    ReportFormat["CSV"] = "csv";
    ReportFormat["JSON"] = "json";
})(ReportFormat || (ReportFormat = {}));
