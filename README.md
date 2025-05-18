# 🛒 E-Commerce Backend API 🛒

## Description

A robust, RESTful e-commerce API built with TypeScript, Express, and MongoDB, offering secure user authentication, product management, order processing, and image uploads.

## Features

* **User Management**: Registration, login, profile updates with role-based access (admin, customer).
* **Product CRUD**: Create, read, update, delete products with categories, pricing, and stock control.
* **Order Processing**: Shopping cart, checkout, order tracking, and status updates.
* **File Uploads**: Secure image uploads for products via Multer.
* **Search & Filtering**: Pagination, filtering by category/price, and full-text search.
* **Testing**: Unit and integration tests with Jest and Supertest.
* **Security**: Input validation, rate limiting, and JWT-based authentication.

## Tech Stack

* **Language:** TypeScript
* **Server:** Node.js, Express
* **Database:** MongoDB, Mongoose
* **Testing:** Jest, Supertest
* **Linting & Formatting:** ESLint, Prettier

## Environment Variables

Copy `.env.example` to `.env` and set:

```dotenv
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
CORS_ORIGIN=http://localhost:3000
```

## Installation & Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Ahmed1mran/E-Commerce-App.git
   cd E-Commerce-App
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Build the project:

   ```bash
   npm run build
   ```
4. Start the server:

   ```bash
   npm start
   ```

## Running Tests

```bash
npm test
```

## Contributing

Feel free to contribute by opening issues and pull requests. Please follow the project's code style and commit message conventions.

