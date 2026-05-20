# API Documentation - Her Mind Safe Space

## Base URL

- Development: `http://localhost:3000`
- Production: (To be configured)

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <accessToken>
```

## Endpoints

### Auth Endpoints

#### 1. Register User

- **POST** `/auth/register`
- **Authentication**: None
- **Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "age": 25
}
```

- **Response** (201):

```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "profile": {
      "userId": "uuid",
      "fullName": "John Doe",
      "age": 25,
      "country": null,
      "preferredLanguage": "en",
      "pronouns": null,
      "onboarded": true,
      "emotionalGoals": [],
      "stressTriggers": [],
      "createdAt": "2026-05-19T...",
      "updatedAt": "2026-05-19T..."
    }
  }
}
```

#### 2. Login User

- **POST** `/auth/login`
- **Authentication**: None
- **Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

- **Response** (200):

```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "profile": {
      /* user profile */
    }
  }
}
```

#### 3. Get Current User

- **GET** `/auth/me`
- **Authentication**: Required (JWT)
- **Response** (200):

```json
{
  "id": "uuid",
  "email": "user@example.com"
}
```

### User Profile Endpoints

#### 4. Get User Profile

- **GET** `/users/profile`
- **Authentication**: Required (JWT)
- **Response** (200):

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "passwordHash": "...",
  "createdAt": "2026-05-19T...",
  "updatedAt": "2026-05-19T...",
  "roles": [
    { "id": "uuid", "userId": "uuid", "role": "USER", "createdAt": "..." }
  ],
  "profile": {
    "userId": "uuid",
    "fullName": "John Doe",
    "age": 25,
    "country": "Kenya",
    "preferredLanguage": "en",
    "pronouns": "he/him",
    "onboarded": true,
    "emotionalGoals": ["Reduce anxiety", "Better sleep"],
    "stressTriggers": ["Work deadlines", "Social events"],
    "createdAt": "2026-05-19T...",
    "updatedAt": "2026-05-19T..."
  }
}
```

#### 5. Update User Profile

- **PATCH** `/users/profile`
- **Authentication**: Required (JWT)
- **Request Body** (all fields optional):

```json
{
  "fullName": "Jane Doe",
  "age": 26,
  "country": "Kenya",
  "preferredLanguage": "sw",
  "pronouns": "she/her",
  "emotionalGoals": ["Manage stress", "Build confidence"],
  "stressTriggers": ["Traffic", "Loud noises"],
  "onboarded": true
}
```

- **Response** (200):

```json
{
  "userId": "uuid",
  "fullName": "Jane Doe",
  "age": 26,
  "country": "Kenya",
  "preferredLanguage": "sw",
  "pronouns": "she/her",
  "onboarded": true,
  "emotionalGoals": ["Manage stress", "Build confidence"],
  "stressTriggers": ["Traffic", "Loud noises"],
  "createdAt": "2026-05-19T...",
  "updatedAt": "2026-05-19T..."
}
```

## Error Responses

### 400 Bad Request

```json
{
  "message": "Email already in use",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized

```json
{
  "message": "Invalid email or password",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### 422 Unprocessable Entity (Validation Error)

```json
{
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Unprocessable Entity",
  "statusCode": 422
}
```

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation or business logic error)
- **401**: Unauthorized (invalid credentials or missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **422**: Unprocessable Entity (validation error)
- **500**: Internal Server Error

## Languages Supported

- en (English)
- sw (Swahili)
- fr (French)
- ha (Hausa)
- yo (Yoruba)

## User Roles

- `USER` - Regular user
- `COUNSELOR` - Professional counselor
- `ADMIN` - System administrator
