var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import sqlite3 from "sqlite3";
import { open } from "sqlite";
let dbPromise = open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
});
export function query(sql_1) {
    return __awaiter(this, arguments, void 0, function* (sql, params = []) {
        const db = yield dbPromise;
        if (sql.trim().toLowerCase().startsWith("select")) {
            return db.all(sql, params);
        }
        else {
            const result = yield db.run(sql, params);
            return { lastID: result.lastID, changes: result.changes };
        }
    });
}
