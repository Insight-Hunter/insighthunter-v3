# Authentication Worker

This Worker handles all authentication operations for Insight Hunter including registration, login, token verification, and password management.

## File Structure

```
workers/auth/
├── index.js          # Main Worker entry point and request routing
├── password.js       # Password hashing and verification
├── jwt.js            # JWT token generation and verification
├── validation.js     # Input validation functions
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "plan_type": "free"
  }
}
```

**Error Responses:**

- 400: Validation error (invalid email, weak password, etc.)
- 409: User already exists
- 500: Server error

-----

### POST /auth/login

Authenticate a user and receive a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "plan_type": "free"
  }
}
```

**Error Responses:**

- 401: Invalid credentials
- 500: Server error

-----

### GET /auth/verify

Verify a JWT token and get current user info.

**Headers:**

```
Authorization: Bearer {}
```

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "plan_type": "free",
    "plan_expires_at": null
  }
}
```

**Error Responses:**

- 401: Invalid or expired token
- 404: User not found
- 500: Server error

-----

### POST /auth/password-reset-request

Request a password reset token.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "If an account exists with that email, a password reset link has been sent"
}
```

**Note:** Always returns success to prevent email enumeration attacks.

-----

### POST /auth/password-reset

Reset password using a valid reset token.

**Request Body:**

```json
{
  "token": "
```# Authentication Worker

This Worker handles all authentication operations for Insight Hunter including registration, login, token verification, and password management.

## File Structure

```
workers/auth/
├── index.js          # Main Worker entry point and request routing
├── password.js       # Password hashing and verification
├── jwt.js            # JWT token generation and verification
├── validation.js     # Input validation functions
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "plan_type": "free"
  }
}
```

**Error Responses:**

- 400: Validation error (invalid email, weak password, etc.)
- 409: User already exists
- 500: Server error

-----

### POST /auth/login

Authenticate a user and receive a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "plan_type": "free"
  }
}
```

**Error Responses:**

- 401: Invalid credentials
- 500: Server error

-----

### GET /auth/verify

Verify a JWT token and get current user info.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "plan_type": "free",
    "plan_expires_at": null
  }
}
```

**Error Responses:**

- 401: Invalid or expired token
- 404: User not found
- 500: Server error

-----

### POST /auth/password-reset-request

Request a password reset token.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "If an account exists with that email, a password reset link has been sent"
}
```

**Note:** Always returns success to prevent email enumeration attacks.

-----

### POST /auth/password-reset

Reset password using a valid reset token.

**Request Body:**

```json
{
  "token": "
```
