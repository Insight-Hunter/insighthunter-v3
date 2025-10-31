// shared/types/auth.ts
// Authentication and User Types
export var UserRole;
(function (UserRole) {
    UserRole["OWNER"] = "owner";
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (UserRole = {}));
export var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["FREE"] = "free";
    SubscriptionPlan["BASIC"] = "basic";
    SubscriptionPlan["PRO"] = "pro";
    SubscriptionPlan["ENTERPRISE"] = "enterprise";
    SubscriptionPlan["WHITE_LABEL"] = "white_label";
})(SubscriptionPlan || (SubscriptionPlan = {}));
