# 📚 BookNest – Smart Online Book Store

![PHP](https://img.shields.io/badge/PHP-8.x-blue)
![MySQL](https://img.shields.io/badge/MySQL-Database-orange)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

## 📖 About the Project

BookNest is a modern full-stack online bookstore web application developed as a Capstone Project. The application provides a secure and responsive platform where users can browse books, manage their shopping cart, place orders, and track purchases, while administrators can efficiently manage books, users, categories, and orders through a dedicated dashboard.

---

# 🚀 Features

## 👤 User Module

- User Registration
- Email OTP Verification
- Secure Login
- Forgot Password
- Password Reset
- User Dashboard
- Profile Management
- Browse Books
- Search Books (AJAX)
- Category Filter
- Price Filter
- Wishlist
- Shopping Cart
- Checkout
- Order History
- Responsive UI

---

## 👨‍💼 Admin Module

- Admin Dashboard
- Book Management (CRUD)
- Category Management
- User Management
- Order Management
- Sales Analytics
- Monthly Revenue Charts
- Active Users
- Dashboard Statistics

---

# 📊 Analytics

- Total Books
- Total Users
- Total Orders
- Revenue
- Monthly Sales
- Popular Categories
- Top Selling Books

---

# 🔐 Security

- Password Hashing
- Session Authentication
- Role-Based Access
- SQL Injection Protection
- XSS Prevention
- Email OTP Verification
- Secure Password Reset
- Input Validation

---

# 🛠 Technologies Used

### Frontend

- HTML5
- CSS3
- Bootstrap 5
- JavaScript
- AJAX

### Backend

- PHP

### Database

- MySQL

### Libraries

- Chart.js
- PHPMailer
- Bootstrap Icons

---

# 📂 Project Structure

```
BookNest/

│── admin/
│── assets/
│── css/
│── js/
│── images/
│── includes/
│
│── login.php
│── register.php
│── forgot_password.php
│── reset_password.php
│── auth.php
│── logout.php
│── dashboard.php
│── books.php
│── cart.php
│── checkout.php
│── profile.php
│── orders.php
│── index.php
│
└── database/
      booknest.sql
```

---

# 🗄 Database Tables

- users
- books
- categories
- cart
- wishlist
- orders
- order_items
- reviews
- otp_verification

---

# 💻 Installation

1. Clone this repository

```
git clone https://github.com/yourusername/BookNest-Capstone-Project.git
```

2. Copy the project into the XAMPP `htdocs` folder.

3. Start Apache and MySQL.

4. Create a database named:

```
booknest
```

5. Import the SQL file.

6. Configure database credentials inside:

```
includes/db.php
```

7. Run the application:

```
http://localhost/BookNest/
```

---

# 👨‍💼 Default Admin Login

```
Email:
admin@booknest.com

Password:
admin123
```

---

# 📱 Responsive Design

- Desktop
- Tablet
- Mobile

---

# 📈 Future Enhancements

- Online Payment Gateway
- AI Book Recommendation
- Live Chat Support
- QR Code Payments
- Dark Mode
- Mobile Application
- Multi-language Support

---

# 📸 Screenshots

- Home Page
- Login
- Register
- Books
- Shopping Cart
- Checkout
- User Dashboard
- Admin Dashboard
- Analytics

---

# 🎯 Project Objectives

- Develop a secure full-stack web application
- Implement authentication with Email OTP
- Build an Admin Dashboard with analytics
- Use AJAX for real-time interactions
- Deploy the project online
- Follow responsive web design principles

---

# 👩‍💻 Developed By

**Kavya Chukkala**

B.Tech Student

Capstone Project – ApexPlanet Software Pvt. Ltd. Online Internship

---

# ⭐ Support

If you like this project, don't forget to ⭐ star this repository.

# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
defines a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.
