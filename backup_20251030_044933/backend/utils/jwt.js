var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function generateJWT(payload_1, secret_1) {
    return __awaiter(this, arguments, void 0, function* (payload, secret, expiresIn = 3600) {
        const header = { alg: 'HS256', typ: 'JWT' };
        const now = Math.floor(Date.now() / 1000);
        const jwtPayload = Object.assign(Object.assign({}, payload), { iat: now, exp: now + expiresIn });
        const encodedHeader = base64UrlEncode(JSON.stringify(header));
        const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
        const signature = yield signHS256(`${encodedHeader}.${encodedPayload}`, secret);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    });
}
export function verifyJWT(token, secret) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [encodedHeader, encodedPayload, signature] = token.split('.');
            if (!encodedHeader || !encodedPayload || !signature)
                return null;
            const expectedSignature = yield signHS256(`${encodedHeader}.${encodedPayload}`, secret);
            if (signature !== expectedSignature) {
                return null;
            }
            const payload = JSON.parse(base64UrlDecode(encodedPayload));
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                return null;
            }
            return payload;
        }
        catch (_a) {
            return null;
        }
    });
}
function signHS256(string, secret) {
    return __awaiter(this, void 0, void 0, function* () {
        const encoder = new TextEncoder();
        const key = yield crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const signature = yield crypto.subtle.sign('HMAC', key, encoder.encode(data));
        return base64UrlEncode(new Uint8Array(signature));
    });
}
// Base64 URL encoding and decoding helpers for JWT
function base64UrlEncode(input) {
    let str;
    if (input instanceof Uint8Array) {
        str = String.fromCharCode(...input);
    }
    else {
        str = input;
    }
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
function base64UrlDecode(input) {
    input = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = input.length % 4;
    if (pad) {
        input += '='.repeat(4 - pad);
    }
    return atob(input);
}
