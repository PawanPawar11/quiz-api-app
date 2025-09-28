# 📝 Quiz API Backend

A RESTful backend API for an online quiz application built with Node.js, Express, and MongoDB. This application provides secure quiz creation, question management, and server-side scoring functionality.

## 🚀 Features

- **Quiz Management**: Create quizzes and add multiple-choice questions
- **Secure Question Delivery**: Questions are served without correct answers to prevent cheating
- **Server-Side Scoring**: Secure answer validation and scoring on the backend
- **RESTful API**: Clean, intuitive API design following REST principles
- **Data Validation**: Robust input validation and error handling
- **Scalable Architecture**: Organized with separation of concerns for maintainability

## 🛠️ Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Vitest with Supertest and MongoDB Memory Server
- **Environment**: dotenv for configuration management
- **Architecture**: MVC pattern with Controllers, Routes, and Services

## 📋 Prerequisites

Before running this application, make sure you have:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [MongoDB](https://www.mongodb.com/) (local or remote instance)
- npm (comes with Node.js)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/PawanPawar11/quiz-api-backend.git
cd quiz-api-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/quiz_app_db

# Server Configuration
PORT=5000
```

### 4. Start the Server

```bash
# Development mode
npm run dev
```

The server will be running at `http://localhost:5000`

## 📚 API Documentation

### Quiz Management Endpoints

#### Create a New Quiz

```http
POST /api/quizzes
Content-Type: application/json

{
  "title": "General Knowledge Quiz"
}
```

**Response:**
```json
{
  "id": "60d5ec49f1b2c8b1f8e4c1a1",
  "title": "General Knowledge Quiz"
}
```

#### Add Question to Quiz

```http
POST /api/quizzes/{quizId}/questions
Content-Type: application/json

{
  "text": "What is the capital of France?",
  "options": [
    {"id": "opt1", "text": "Berlin"},
    {"id": "opt2", "text": "Madrid"},
    {"id": "opt3", "text": "Paris"},
    {"id": "opt4", "text": "Rome"}
  ],
  "correctOptionId": "opt3"
}
```

**Response:**
```json
{
  "id": "60d5ec49f1b2c8b1f8e4c1a2",
  "quizId": "60d5ec49f1b2c8b1f8e4c1a1",
  "text": "What is the capital of France?",
  "options": [
    {"id": "opt1", "text": "Berlin"},
    {"id": "opt2", "text": "Madrid"},
    {"id": "opt3", "text": "Paris"},
    {"id": "opt4", "text": "Rome"}
  ],
  "correctOptionId": "opt3"
}
```

### Quiz Taking Endpoints

#### Get All Quizzes

```http
GET /api/quizzes
```

**Response:**
```json
[
  {
    "id": "60d5ec49f1b2c8b1f8e4c1a1",
    "title": "General Knowledge Quiz"
  }
]
```

#### Get Quiz Questions

```http
GET /api/quizzes/{quizId}/questions
```

**Response:** (Note: `correctOptionId` is excluded)
```json
[
  {
    "id": "60d5ec49f1b2c8b1f8e4c1a2",
    "text": "What is the capital of France?",
    "options": [
      {"id": "opt1", "text": "Berlin"},
      {"id": "opt2", "text": "Madrid"},
      {"id": "opt3", "text": "Paris"},
      {"id": "opt4", "text": "Rome"}
    ]
  }
]
```

#### Submit Quiz Answers

```http
POST /api/quizzes/{quizId}/submit
Content-Type: application/json

{
  "answers": [
    {"questionId": "60d5ec49f1b2c8b1f8e4c1a2", "selectedOptionId": "opt3"},
    {"questionId": "60d5ec49f1b2c8b1f8e4c1a3", "selectedOptionId": "optB"}
  ]
}
```

**Response:**
```json
{
  "score": 2,
  "total": 5,
}
```

## 🧪 Testing

This project includes comprehensive test coverage using Vitest.

### Running Tests

```bash
# Run all tests
npm test
```

### Test Coverage

- **API Integration Tests**: All endpoints tested with various scenarios
- **Model Validation Tests**: Database schema validation
- **Error Handling Tests**: Edge cases and error scenarios
- **Security Tests**: Ensures correct answers aren't exposed in API responses

### Test Results
- ✅ 24 passing tests
- 🧪 Uses in-memory MongoDB for isolated testing
- 🚀 Fast test execution with Vitest

## 📁 Project Structure

```
quiz-api-backend/
├── src/
│   ├── controllers/         # Business logic handlers
│   │   └── quizControllers.js
│   ├── models/             # Database schemas
│   │   ├── Quiz.js
│   │   └── Question.js
│   ├── routes/             # API route definitions
│   │   └── quizRoutes.js
│   ├── config/             # Configuration files
│   │   └── db.js
│   ├── tests/              # Test files
│   │   ├── quiz.test.js
│   │   └── models.test.js
│   └── server.js           # Application entry point
├── .env                    # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testing

### Testing with Postman

1. Import the provided API collection file
2. Set up your environment variables
3. Test each endpoint following the API documentation above

## 🏗️ Architecture & Design Decisions

### 1. Separation of Concerns
- **Routes**: Handle HTTP routing and parameter extraction
- **Controllers**: Process requests and coordinate with services
- **Services**: Contain business logic and data processing
- **Models**: Define data structure and database interactions

### 2. Security Considerations
- **Answer Protection**: Correct answers are never exposed in question retrieval endpoints
- **Server-Side Validation**: All scoring is performed on the backend
- **Input Sanitization**: All user inputs are validated and sanitized

### 3. Data Models

#### Quiz Model
```javascript
{
  id: ObjectId,
  title: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Question Model
```javascript
{
  id: ObjectId,
  quizId: ObjectId,
  text: String,
  options: [{ id: String, text: String }],
  correctOptionId: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running locally
- Check your `MONGO_URI` in the `.env` file
