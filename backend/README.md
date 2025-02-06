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
│   └── db.js         # Database connection setup
├── controllers/       # Route controllers
│   └── userController.js # User-related endpoints
├── models/           # Mongoose models
│   ├── Chore.js     # Chore model
│   ├── Expense.js   # Expense model (updated)
│   ├── HouseholdTask.js # Household task model
│   ├── Notification.js # Notification model (updated)
│   └── User.js      # User model
├── tests/           # Test files
│   └── models/      # Model tests
│       ├── Chore.test.js
│       ├── Expense.test.js
│       ├── HouseholdTask.test.js
│       ├── Notification.test.js
│       └── User.test.js
├── .env             # Environment variables
├── .gitignore       # Git ignore rules
├── Database_Structure.txt # Database schema documentation
├── jest.config.js   # Jest configuration
├── package.json     # Project dependencies and scripts
├── server.js        # Main application entry point
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

All models have comprehensive test coverage including:
- Validation of required fields
- Data type verification
- Business logic validation
- Error handling

## Model Validations
Each model includes built-in validations:

### Expense Model
- Positive amounts only
- Required fields: description, total_amount, paid_by, split_among
- Split amounts must be properly structured with user and amount

### User Model
- Email validation and uniqueness
- Password minimum length: 8 characters
- Required fields validation

### Notification Model
- Read status tracking
- Required recipient validation
- Message and type validation

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
