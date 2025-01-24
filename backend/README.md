# Backend Setup Guide

## Prerequisites
- Node.js v18+
- MongoDB (local or cloud instance)
- npm

## Installation
1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration
1. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=3001
   JWT_SECRET=your-secret-key
   ```

2. Choose your MongoDB setup:

   **Option 1: MongoDB Atlas (Cloud)**   (I used this one)
   - Create a free cluster at https://www.mongodb.com/cloud/atlas
   - Get your connection string from the Atlas dashboard
   - Add it to `.env` as:
     ```
     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/your-database-name?retryWrites=true&w=majority
     ```

   **Option 2: Local MongoDB**
   - Install MongoDB Community Edition: https://www.mongodb.com/try/download/community
   - Start MongoDB service
   - Add to `.env`:
     ```
     MONGO_URI=mongodb://localhost:27017/your-database-name
     ```

## Running the Server
Start the development server:
```bash
npm run dev
```

## Project Structure
```
backend/
├── config/            # Configuration files
│   └── db.js          # Database connection setup
├── controllers/       # Route controllers
│   └── userController.js # User-related endpoints
├── models/            # Mongoose models
│   ├── Chore.js       # Chore model
│   ├── Expense.js     # Expense model
│   ├── HouseholdTask.js # Household task model
│   ├── Notification.js # Notification model
│   └── User.js        # User model
├── tests/             # Test files
│   └── models/        # Model tests
│       └── User.test.js # User model tests
├── .env               # Environment variables
├── .gitignore         # Git ignore rules
├── Database_Structure.txt # Database schema documentation
├── jest.config.js     # Jest configuration
├── package.json       # Project dependencies and scripts
├── server.js          # Main application entry point
```

## Key Files
- `server.js`: Main application entry point, sets up Express server and routes
- `config/db.js`: Handles MongoDB connection
- `models/`: Contains Mongoose models for database entities
- `controllers/`: Contains route handlers for API endpoints

## Testing
Run tests using Jest:
```bash
npm test
```

## API Documentation
The backend provides RESTful APIs for:
- User management
- Chore tracking
- Expense management
- Household tasks
- Notifications

See individual controller files for specific endpoint documentation.

## Environment Variables
- `PORT`: Server port (default: 3001)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JSON Web Tokens

## Troubleshooting
- Ensure MongoDB is running
- Verify all environment variables are set
- Check server logs for errors
