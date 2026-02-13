# Backend Implementation Requirements

This document outlines the API endpoints and data structures currently mocked in the frontend. To fully integrate the application, the backend should implement these endpoints following the expected response formats.

## General Response Format

The frontend expects a consistent wrapper for successful responses:

```json
{
  "response": { ... data ... },
  "message": "Optional success message"
}
```

## Required Endpoints

### 1. Dashboard

- **`GET /api/dashboard/summary`**

  - **Description**: Returns current financial summary.
  - **Response**:
    ```json
    {
      "balance": number,
      "income": number,
      "expense": number
    }
    ```

- **`GET /api/dashboard/breakdown`**
  - **Description**: Returns data for the financial breakdown chart.
  - **Response**: Array of:
    ```json
    {
      "category": string,
      "amount": number,
      "color": string (hex)
    }
    ```

### 2. Transactions

- **`GET /api/transactions`**

  - **Parameters**:
    - `limit`: (optional) Number of latest transactions to return (e.g., for dashboard).
    - `month`: (optional) Filter by month.
    - `page`: (optional) Page number (default: 1).
    - `size`: (optional) Number of items per page (default: 10).
  - **Response**:
    ```json
    {
      "response": [ ... Transaction objects ... ],
      "pagination": {
        "total": number,
        "page": number,
        "size": number,
        "totalPages": number
      }
    }
    ```

- **`GET /api/transactions/:id`**

  - **Response**: Single `Transaction` object.

- **`POST /api/transactions`**

  - **Body**: `{ description, amount, type, category, date }`

- **`PUT /api/transactions/:id`**

  - **Body**: Update fields.

- **`DELETE /api/transactions/:id`**

### 3. Categories

- **`GET /api/categories`**

  - **Response**: Array of `Category` objects.

- **`GET /api/categories/:id`**

  - **Response**: Single `Category` object.

- **`POST /api/categories`**
- **`PUT /api/categories/:id`**
- **`DELETE /api/categories/:id`**

### 4. Users & Profile

- **`GET /api/users`** (Admin only)

  - **Response**: Array of `User` objects.

- **`GET /api/users/profile`**

  - **Response**: `User` object for the authenticated user.

- **`PUT /api/users/:id`**

---

## Data Models

### Transaction

```typescript
{
  id: number
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string // ISO format (YYYY-MM-DD)
}
```

### Category

```typescript
{
  id: number
  name: string
  type: 'INCOME' | 'EXPENSE'
}
```

### User

```typescript
{
  id: number
  username: string
  email: string
  role: 'USER' | 'ADMIN'
}
```
