# 🚀 Management Application - Backend

RESTful API built with Node.js, Express, MongoDB Atlas, JWT Authentication, and Socket.IO for a project management application.

## 🔗 Links

- **API URL:** https://management-application-back-end.vercel.app/
- **Frontend Repository:** https://github.com/AhmedAli300/Management-Application-FrontEnd
- **Backend Repository:** https://github.com/AhmedAli300/Management-Application-BackEnd
- **Frontend Live Demo:** https://management-application-8kbm.vercel.app/

---

## ✨ Features

- JWT Authentication
- User Management
- Project CRUD
- Task CRUD
- Team Member Management
- Role-based Authorization
- Socket.IO Real-time Updates
- MongoDB Atlas Integration

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- Bcrypt
- Socket.IO
- Validator

---

## 📁 Project Structure

```
controllers
middlewares
models
routes
tests
utils
index.js
```

---

## 🏗 Architecture

The backend follows a layered architecture.

- Routes define API endpoints.
- Controllers contain business logic.
- Models define MongoDB schemas.
- Middleware handles authentication.
- Socket.IO enables real-time communication.

---

## ⚙️ Installation

Clone repository

```bash
git clone https://github.com/AhmedAli300/Management-Application-BackEnd.git
```

Install dependencies

```bash
npm install
```

Create `.env`

```env
PORT=3000
SECRET=your_jwt_secret
MONGO_URI=your_mongodb_connection_string
```

Start server

```bash
npm start
```

---

## 🌱 Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server Port |
| SECRET | JWT Secret |
| MONGO_URI | MongoDB Atlas Connection String |

---

## 🗄 Database

The application uses **MongoDB Atlas**.

Update the `MONGO_URI` inside the `.env` file before running the project.

---

## 🧪 Testing

Run API tests

```bash
npm test
```

---

## 📌 API Endpoints

Authentication

- Login
- Register

Projects

- Create Project
- Update Project
- Delete Project
- Get Projects

Tasks

- Create Task
- Update Task
- Delete Task
- Get Tasks

Users

- Get Members
- Manage Project Members

---

##  Demo Accounts

### Admin

Email

```
admin123@gmail.com
```

Password

```
12345678
```

### Member

Email

```
member123@gmail.com
```

Password

```
12345678
```

---
