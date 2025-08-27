# Authentication API Documentation

## Overview
This API provides comprehensive authentication functionality including traditional email/password authentication and Google OAuth2 integration.

## Base URL
```
http://localhost:5000/api/auth
```

## Endpoints

### 1. Register User
**POST** `/register`

Register a new user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id_user": "uuid-here",
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400`: Validation errors (missing required fields, invalid email format)
- `409`: Email or username already exists

### 2. Login User
**POST** `/login`

Login with email/username and password.

**Request Body:**
```json
{
  "emailOrUsername": "user@example.com", // or "johndoe"
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id_user": "uuid-here",
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400`: Missing email/username or password
- `401`: Invalid credentials

### 3. Get User Profile
**GET** `/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "user": {
    "id_user": "uuid-here",
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401`: No token provided or invalid token
- `403`: Token expired

### 4. Update User Profile
**PUT** `/profile`

Update current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "full_name": "John Updated Doe",
  "phone": "+9876543210",
  "username": "johnupdated"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id_user": "uuid-here",
    "email": "user@example.com",
    "username": "johnupdated",
    "full_name": "John Updated Doe",
    "phone": "+9876543210",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401`: Authentication required
- `409`: Username already exists

### 5. Change Password
**PUT** `/change-password`

Change current user's password.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400`: Missing current or new password, or current password incorrect
- `401`: Authentication required

### 6. Google OAuth2 Login
**GET** `/google`

Initiate Google OAuth2 login flow.

**Response:**
Redirects to Google authentication page.

### 7. Google OAuth2 Callback
**GET** `/google/callback`

Handle Google OAuth2 callback.

**Response:**
Redirects to frontend with JWT token:
```
{FRONTEND_URL}/auth/success?token={jwt-token}
```

Or on error:
```
{FRONTEND_URL}/auth/error
```

### 8. Logout
**POST** `/logout`

Logout user (client should remove token).

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "details": "Additional error details (optional)",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Environment Variables Required

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Session (for OAuth)
SESSION_SECRET=your-session-secret
```

## Security Features

1. **Password Hashing**: Uses bcrypt with 12 salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **Input Validation**: Email format validation and required field checks
4. **Duplicate Prevention**: Checks for existing email/username
5. **OAuth2 Integration**: Secure Google authentication
6. **Protected Routes**: Middleware-based authentication
