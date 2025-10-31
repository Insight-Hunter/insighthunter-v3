var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const API = "http://localhost:4000/api/onboarding";
export function savePersonalInfo(any) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${API}/personal-info`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        });
        return res.json();
    });
}
export function saveBusinessSetup(any) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${API}/business-setup`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
        });
        return res.json();
    });
}
export function uploadCsv(csvFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const formData = new FormData();
        formData.append("csvFile", csvFile);
        const res = yield fetch(`${API}/csv-upload`, { method: "POST", body: formData });
        return res.json();
    });
}
export function connectPlaid(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${API}/plaid-connect`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        return res.json();
    });
}
export function connectThirdParty(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${API}/third-party-connect`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        return res.json();
    });
}
export function saveInvoiceSettings(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${API}/invoice-setup`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        return res.json();
    });
}
export function finalizeOnboarding(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${API}/finalize`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        return res.json();
    });
}
