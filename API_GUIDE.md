# API Integration Guide

## Request Headers

All API requests should include:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {jwt_token}'
}
```

## Response Format

Success Response (200):
```json
{
  "id": 1,
  "name": "Product Name",
  ...
}
```

Error Response (400/401/404/500):
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Error details"]
  }
}
```

## Common Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **422** - Validation Error
- **500** - Server Error

## Rate Limiting

Not implemented yet. Can be added using Laravel rate limiting.

## Authentication Flow

1. User logs in with email/password
2. API returns JWT token
3. Store token in localStorage
4. Include token in all subsequent requests
5. On token expiration, re-authenticate

## CORS Configuration

Configured for:
- `http://localhost:3000`
- `http://localhost:5173`

For production, update in `backend/config/cors.php`
