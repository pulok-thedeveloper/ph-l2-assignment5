# 🚖 Ride Booking API

## 📌 Description
A secure, scalable, and role-based backend API for a ride booking system (similar to Uber/Pathao).  
It enables riders to request rides, drivers to accept and complete rides, and admins to manage the entire system.  
Built with **Node.js, Express.js, and MongoDB (Mongoose)**, with strict **JWT authentication** and **role-based access control (RBAC)**.

---

## ✨ Features
- 👤 **User Management**: Riders, Drivers, and Admins with role-specific permissions.
- 🔐 **Authentication**: JWT-based login, refresh tokens, logout, and password reset.
- 🚘 **Ride Lifecycle**: Request, accept, start, complete, cancel with timestamps.
- 🧾 **Driver Earnings**: Track completed rides, earnings, and payouts.
- ⭐ **Feedback System**: Riders provide ratings & feedback; drivers’ global average rating auto-updated.
- 📊 **Admin Dashboard**: Analytics including total rides, revenue, driver status, cancel rate, and average ratings.

---

## ⚙️ How Features Work
1. **Ride Requests**
   - Riders request a ride with pickup & destination.
   - Drivers can view available rides and accept if online and approved.

2. **Driver Availability**
   - Drivers toggle availability (`isOnline`).
   - Suspended or currently-on-ride drivers cannot accept new rides.

3. **Ride Fulfillment**
   - Once a driver accepts, the ride progresses through statuses:
     - `requested → accepted → picked_up → in_transit → completed`
   - Rider can cancel **only before driver accepts**.

4. **Feedback & Ratings**
   - After completion, rider submits feedback with rating.
   - Driver’s `globalAverageRating` updates automatically.

5. **Earnings Tracking**
   - On ride completion, fare is logged in driver’s profile.
   - Admin dashboard aggregates driver earnings.

6. **Admin Control**
   - Manage users (approve/suspend drivers, block riders).
   - View all rides & system analytics.

---

## 📡 API Routes

### 🔐 Auth
- `POST /auth/login` – Login with credentials  
- `POST /auth/refresh-token` – Get new access token  
- `POST /auth/logout` – Logout user  
- `POST /auth/reset-password` – Reset password  

### 👤 Users
- `POST /user/register` – Register a new user  
- `PATCH /user/:id` – Update user profile  
- `GET /user/all-users` – Get all users (Admin only)  
- `PATCH /user/block/:id` – Block or unblock user (Admin only)  

### 🚗 Drivers
- `PATCH /drivers/approve/:id` – Approve driver (Admin)  
- `PATCH /drivers/suspend/:id` – Suspend driver (Admin)  
- `PATCH /drivers/availability` – Update availability (Driver)  
- `GET /drivers/earnings` – Get driver earnings  

### 🚘 Rides
- `POST /ride/request` – Rider requests a ride  
- `POST /ride/cancel/:id` – Cancel a ride (Rider/Driver, before acceptance)  
- `GET /ride/my` – Get my rides (Rider/Driver)  
- `GET /ride/available` – Get available rides (Driver)  
- `GET /ride/:id` – Get ride by ID (Rider/Driver/Admin)  
- `POST /ride/status/:id` – Update ride status (Driver)  
- `POST /ride/feedback/:id` – Add ride feedback (Rider)  

### 📊 Admin
- `GET /admin/analytics` – System analytics  

---

## 🫵 Validations & Business Rules
- ❌ Suspended drivers **cannot accept rides**.  
- ❌ A driver **cannot accept** if already on an active ride.  
- ❌ A rider **cannot request multiple active rides**.  


---

## 📜 Access & Visibility
- ✅ Riders can view **all past rides**.  
- ✅ Drivers can view **pending + completed rides**.  
- ✅ Admins can:  
  - View all ride records  
  - Block/unblock riders & drivers  
  - Change ride statuses manually

---

## 🔐 Role-Based Control
- **Rider-only endpoints**: `/ride/request`, `/ride/cancel/:id`, `/ride/feedback/:id`  
- **Driver-only endpoints**: `/drivers/availability`, `/drivers/earnings`, `/ride/status/:id`  
- **Admin-only endpoints**: `/drivers/approve/:id`, `/drivers/suspend/:id`, `/user/all-users`, `/admin/analytics`  
- **Shared endpoints**: `/ride/my`, `/ride/:id`  
- 🔒 Protected by **JWT + role-based middleware (`checkAuth`)**.  

---

## 🚘 Ride Request & Fulfillment
- Rides are **matched manually**: drivers choose available requests.  
- Cancellation: allowed **only before acceptance**.  
- If no driver available → return error `"No driver available"`.  
- Pickup/destination stored as:
  - 📍 Coordinates (`lat`, `long`)  
  - 🏠 Human-readable address  

---

## 🛠 Ride Lifecycle & Status
 - requested → accepted → picked_up → in_transit → completed

- Cancellation: allowed **before acceptance only**.  
- Status updates: handled by **Driver** (except Admin override).  
- Each status transition logs a **timestamp** (`acceptedAt`, `pickedUpAt`, `completedAt`, `cancelledAt`).

---