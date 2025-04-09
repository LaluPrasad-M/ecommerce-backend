# E-Commerce Backend API

This is the backend API for an e-commerce application built with Node.js, Express, and MongoDB.

## Features

- User (Customer/Admin) Authentication with JWT
- Product Management
- Shopping Cart Functionality with GST calculation
- Order Processing and Inventory Management
- Coupon Management with validation
- Admin Dashboard with metrics

## Technology Stack

- **Node.js with Express**: For creating RESTful APIs
- **MongoDB with Mongoose**: For database operations
- **JWT**: For authentication and authorization
- **bcryptjs**: For password hashing
- **Docker & Docker Compose**: For containerized deployment

## Project Architecture

### Directory Structure
```
├── app/
│   ├── controllers/     # Business logic for API endpoints
│   ├── middlewares/     # Authentication and request processing
│   ├── models/          # Database schemas and models
│   ├── routes/          # API route definitions
│   └── utils/           # Helper functions and utilities
├── config/              # Application configuration
├── scripts/             # Utility scripts
├── .env                 # Environment variables
├── Dockerfile           # Container configuration
├── docker-compose.yml   # Multi-container setup
└── server.js            # Application entry point
```

### Key Design Patterns
- **MVC Architecture**: Separation of concerns between Models, Routes (Views), and Controllers
- **Single Responsibility Principle**: Each module handles a specific part of the application
- **Middleware Pattern**: For authentication, error handling, and request processing
- **Repository Pattern**: Abstract database operations in models
- **Role-based Authorization**: Different endpoints for customers and admins

### Authentication Flow
- JWT-based authentication with token generation on login
- Role-based middleware to restrict access to endpoints
- Secure password hashing with bcryptjs

### Data Models
- **User**: Single model with role separation for customers and admins
- **Product**: Stores product details, inventory, and pricing information
- **Cart**: Manages user shopping cart with item details
- **Order**: Tracks order status, items, and payment information
- **Coupon**: Defines discount codes and validity rules

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or via Docker)
- npm or yarn
- Docker and Docker Compose (for containerized setup)

### Installation

#### Option 1: Local Setup

1. Clone the repository
   ```
   git clone https://github.com/LaluPrasad-M/ecommerce-backend.git
   cd ecommerce-backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_KEY=your_secure_jwt_key
   NODE_ENV=development
   ```

4. Start the server
   ```
   npm start
   ```
   The server will start on http://localhost:3000 with nodemon for auto-reloading during development.

#### Option 2: Docker Setup

1. Clone the repository and navigate to the project directory

2. Create a `.env` file (optional - Docker Compose has default values)

3. Start the containers with Docker Compose
   ```
   docker-compose up
   ```

4. The application will be available at:
   - API: http://localhost:3000
   - MongoDB admin interface: http://localhost:8081

5. To run in background:
   ```
   docker-compose up -d
   ```

6. To stop the containers:
   ```
   docker-compose down
   ```

### Development Environment

The project includes the following tools for development:
- **Nodemon**: Auto-restarts the server when code changes are detected
- **Mongo Express**: Web-based MongoDB admin interface for database management

## Default Admin User

On first startup, the system automatically creates an admin user with:
- Mobile Number: 9999999999
- Password: Admin@123

You can use these credentials to access the admin endpoints.

## API Documentation

### Authentication

- **Register Customer**
  - `POST /customer/register`
  - Request Body:
    ```json
    {
      "name": "John Doe",
      "address": "123 Main St",
      "mobileNumber": "1234567890",
      "dateOfBirth": "1990-01-01",
      "email": "john@example.com",
      "password": "StrongPassword123@"
    }
    ```

- **Login**
  - `POST /customer/login` (for customers)
  - `POST /admin/login` (for admins)
  - Request Body:
    ```json
    {
      "mobileNumber": "1234567890",
      "password": "StrongPassword123@"
    }
    ```
  - Response includes JWT token to be used in Authorization header

### API Endpoints

#### Customer Endpoints

- **Profile**
  - `GET /customer/profile` - Get customer profile
  - `PUT /customer/profile` - Update customer profile

- **Products**
  - `GET /customer/products` - Get all products
  - `GET /customer/products/:id` - Get product details
  - `GET /customer/categories` - Get product categories

- **Cart**
  - `GET /customer/cart` - Get cart
  - `POST /customer/cart` - Add item to cart
  - `PUT /customer/cart` - Update cart item
  - `DELETE /customer/cart/:productId` - Remove item from cart
  - `POST /customer/cart/coupon` - Apply coupon
  - `DELETE /customer/cart/coupon` - Remove coupon

- **Orders**
  - `POST /customer/orders` - Place order
  - `GET /customer/orders` - Get order history
  - `GET /customer/orders/:id` - Get order details
  - `PUT /customer/orders/:id/cancel` - Cancel order

#### Admin Endpoints

- **Products**
  - `GET /admin/products` - Get all products
  - `POST /admin/products` - Add product
  - `PUT /admin/products/:id` - Update product
  - `DELETE /admin/products/:id` - Delete product

- **Orders**
  - `GET /admin/orders` - Get all orders
  - `PUT /admin/orders/:id/status` - Update order status

- **Coupons**
  - `GET /admin/coupons` - Get all coupons
  - `POST /admin/coupons` - Create coupon
  - `PUT /admin/coupons/:id` - Update coupon
  - `DELETE /admin/coupons/:id` - Delete coupon

- **Dashboard**
  - `GET /admin/dashboard` - Get dashboard metrics

## Authorization

All endpoints (except registration and login) require JWT authentication.
Include the token in the request header:
```
Authorization: Bearer <token>
```

## Error Handling

The API uses a centralized error handling mechanism with appropriate HTTP status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication errors)
- 403: Forbidden (authorization errors)
- 404: Not Found
- 500: Internal Server Error

## Business Logic Details

### Cart and Pricing
- Products are added to cart with quantity
- Price calculations include GST
- Coupons can be applied for discounts
- Inventory check is performed before order placement

### Order Processing
- Orders are created from cart items
- Inventory is updated upon order placement
- Orders have multiple status phases: Pending, Processing, Shipped, Delivered, Cancelled

### Admin Dashboard
- Provides insights on sales, inventory, and customer metrics
- Allows monitoring of order status and product performance

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

