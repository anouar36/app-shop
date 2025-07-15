# Admin Authentication Setup - Complete

## 🎯 Admin Login Credentials
- **Email**: `admin@shop.com`
- **Password**: `admin123`

## 🔐 Authentication Flow

### 1. Admin Login
**POST** `/api/admin/login`
```json
{
  "email": "admin@shop.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "1|Il6AJvVGLu5GFT48swBxfE4RKjRgQRtaZgw3VdGm3c0d2f90",
  "user": {
    "id": 1,
    "name": "Admin",
    "last_name": "User",
    "email": "admin@shop.com",
    "role": "admin"
  }
}
```

### 2. Access Admin Dashboard
**GET** `/api/admin/dashboard`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "message": "Welcome to Admin Dashboard",
  "stats": {
    "total_users": 2,
    "total_products": 3,
    "total_orders": 0,
    "total_categories": 4
  }
}
```

## 🛡️ Protected Admin Routes
All routes require `Authorization: Bearer {token}` header:

- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List all users
- `GET /api/admin/analytics` - Analytics data

## 💻 Frontend Integration

For your Next.js admin page at `http://localhost:3000/admin`, use this JavaScript:

```javascript
// Admin login function
async function adminLogin(email, password) {
  const response = await fetch('http://127.0.0.1:8000/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store token in localStorage
    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('admin_user', JSON.stringify(data.user));
    return data;
  } else {
    throw new Error(data.message || 'Login failed');
  }
}

// Get dashboard data
async function getDashboard() {
  const token = localStorage.getItem('admin_token');
  
  const response = await fetch('http://127.0.0.1:8000/api/admin/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
}

// Check if user is authenticated admin
function isAdminAuthenticated() {
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  return token && user.role === 'admin';
}
```

## 🚀 Additional Features Available

### Client Authentication
- **POST** `/api/client/login` - Client login
- **POST** `/api/register` - Client registration
- **Email**: `client@shop.com` **Password**: `client123`

### General Routes
- **GET** `/api/user` - Get current authenticated user
- **POST** `/api/logout` - Logout current user
- **GET** `/api/products` - Public products list
- **GET** `/api/categories` - Public categories list

## ✅ Status
- ✅ Admin authentication working
- ✅ Token-based security (Sanctum)
- ✅ Admin dashboard protected
- ✅ Middleware protection active
- ✅ Database seeded with test users
- ✅ API endpoints tested and working

## 🔧 Next Steps for Frontend
1. Create login form in `/admin` page
2. Store token in localStorage/cookies
3. Redirect to dashboard after login
4. Add token to all API requests
5. Handle token expiration
6. Add logout functionality
