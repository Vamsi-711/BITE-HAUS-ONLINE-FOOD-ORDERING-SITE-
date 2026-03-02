# 🍔 BITEHAUS — Backend API

Node.js + Express + MongoDB REST API for the BITEHAUS food ordering platform.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and Razorpay keys
```

### 3. Seed the database (menu items + admin user)
```bash
node config/seed.js
```

### 4. Start the server
```bash
npm run dev     # development (auto-restarts with nodemon)
npm start       # production
```

Server runs at: `http://localhost:5000`

---

## 📁 Project Structure

```
bitehaus-backend/
├── server.js               # Entry point
├── .env.example            # Environment variables template
├── config/
│   └── seed.js             # DB seeder
├── models/
│   ├── User.js             # User schema
│   ├── MenuItem.js         # Menu item schema
│   └── Order.js            # Order schema
├── controllers/
│   ├── authController.js
│   ├── menuController.js
│   ├── orderController.js
│   ├── paymentController.js
│   └── adminController.js
├── routes/
│   ├── auth.js
│   ├── menu.js
│   ├── orders.js
│   ├── payment.js
│   └── admin.js
└── middleware/
    └── auth.js             # JWT protect + role restrict
```

---

## 🔐 Authentication

All protected routes require a Bearer token in the header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📡 API Reference

### Auth  `/api/auth`

| Method | Endpoint              | Auth     | Description          |
|--------|-----------------------|----------|----------------------|
| POST   | `/register`           | Public   | Create account       |
| POST   | `/login`              | Public   | Login, get JWT       |
| GET    | `/me`                 | User     | Get profile          |
| PUT    | `/update-profile`     | User     | Update name/address  |
| PUT    | `/change-password`    | User     | Change password      |

**Register body:**
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "secret123",
  "phone": "9876543210"
}
```

---

### Menu  `/api/menu`

| Method | Endpoint    | Auth     | Description              |
|--------|-------------|----------|--------------------------|
| GET    | `/`         | Public   | Get all items            |
| GET    | `/?category=burger` | Public | Filter by category |
| GET    | `/?featured=true`   | Public | Featured items only |
| GET    | `/:id`      | Public   | Get single item          |
| POST   | `/`         | Admin    | Add menu item            |
| PUT    | `/:id`      | Admin    | Update menu item         |
| DELETE | `/:id`      | Admin    | Delete menu item         |

---

### Orders  `/api/orders`

| Method | Endpoint           | Auth | Description          |
|--------|--------------------|------|----------------------|
| POST   | `/`                | User | Place an order       |
| GET    | `/my-orders`       | User | Get your orders      |
| GET    | `/:id`             | User | Get single order     |
| PUT    | `/:id/cancel`      | User | Cancel order         |

**Place order body:**
```json
{
  "items": [
    { "menuItem": "<menu_item_id>", "quantity": 2 },
    { "menuItem": "<menu_item_id>", "quantity": 1 }
  ],
  "deliveryAddress": {
    "street": "12 MG Road",
    "city": "Hyderabad",
    "state": "Telangana",
    "pincode": "500001"
  },
  "paymentMethod": "razorpay",
  "promoCode": "FIRST50",
  "notes": "Extra spicy please"
}
```

**Promo Codes:**
- `FIRST50` → 50% off subtotal
- `SAVE20`  → ₹20 flat discount

---

### Payment  `/api/payment`

| Method | Endpoint               | Auth | Description                    |
|--------|------------------------|------|--------------------------------|
| POST   | `/create-order`        | User | Create Razorpay payment order  |
| POST   | `/verify`              | User | Verify payment signature       |
| GET    | `/status/:orderId`     | User | Get payment status             |

**Payment flow:**
1. Place order → get `orderId`
2. Call `/payment/create-order` with `orderId`
3. Open Razorpay checkout on frontend with returned `razorpayOrderId`
4. After payment, call `/payment/verify` with Razorpay response
5. Order status updates to `confirmed`

---

### Admin  `/api/admin`  *(Admin only)*

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/dashboard`              | Stats, revenue, charts   |
| GET    | `/orders`                 | All orders (paginated)   |
| GET    | `/orders?status=pending`  | Filter by status         |
| PUT    | `/orders/:id/status`      | Update order status      |
| GET    | `/users`                  | All users (paginated)    |
| PUT    | `/users/:id/toggle`       | Activate/deactivate user |

**Order statuses:**
`pending` → `confirmed` → `preparing` → `out_for_delivery` → `delivered`

---

## 🗄️ Database Models

### User
```
name, email, password (hashed), phone, address, role (user/admin), isActive
```

### MenuItem
```
name, description, price, category, image, badge, rating, isAvailable, isFeatured
```

### Order
```
user, items[], deliveryAddress, subtotal, deliveryFee, discount,
totalAmount, status, paymentStatus, paymentMethod, razorpayOrderId,
razorpayPaymentId, promoCode, estimatedTime, notes
```

---

## 🔑 Default Admin Credentials
```
Email:    admin@bitehaus.com
Password: Admin@123
```
*(Change these in .env before going live!)*

---

## 🛡️ Security Features
- Passwords hashed with **bcrypt** (12 salt rounds)
- JWT-based authentication with expiry
- Role-based access control (user / admin)
- Rate limiting (100 req / 15 min per IP)
- Razorpay **signature verification** to prevent payment spoofing

---

## 📦 Tech Stack
| Layer      | Technology          |
|------------|---------------------|
| Runtime    | Node.js             |
| Framework  | Express.js          |
| Database   | MongoDB + Mongoose  |
| Auth       | JWT + bcryptjs      |
| Payments   | Razorpay            |
| Dev tools  | nodemon, dotenv     |
