# Inventory Management System

A simple inventory management system built with Remix.js, Prisma, and Shopify Polaris.

## Setup Instructions

1. Install dependencies:
   npm install
   ```

2. Set up your PostgreSQL database and update the `.env` file with your database URL:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db"
   ```

3. Run database migrations:
 
   npx prisma migrate dev
   ```

4. Start the development server:
   
   npm run dev
   ```

