# Management Application - Backend

RESTful API built with Node.js, Express, MongoDB Atlas, JWT Authentication, and Socket.IO for a project management application.

## 🔗 Links

- **API URL:** https://management-application-back-end.vercel.app/
- **Frontend Repository:** https://github.com/AhmedAli300/Management-Application-FrontEnd
- **Backend Repository:** https://github.com/AhmedAli300/Management-Application-BackEnd
- **Frontend Live Demo:** https://management-application-8kbm.vercel.app/

---

##  Features

- JWT Authentication
- User Management
- Project CRUD
- Task CRUD
- Team Member Management
- Role-based Authorization
- Socket.IO Real-time Updates
- MongoDB Atlas Integration

---

##  Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- Bcrypt
- Socket.IO
- Validator

---

##  Project Structure

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

##  Architecture

The backend follows a layered architecture.

- Routes define API endpoints.
- Controllers contain business logic.
- Models define MongoDB schemas.
- Middleware handles authentication.
- Socket.IO enables real-time communication.

---

## Installation

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

## Environment Variables

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

##  Testing

Run API tests

```bash
npm test
```

---

## API Documentation

A Postman Collection is included in this repository to simplify testing the API endpoints.

### Collection Location

```
postman/Management-Application.postman_collection.json


### How to Use

1. Import the collection into Postman.
2. Create an environment with the following variables:

| Variable | Value |
|----------|------|
| base_url | https://management-application-back-end.vercel.app |
| token | *(Leave empty)* |

3. Run the **Login** request using one of the demo accounts.
4. Copy the returned JWT token.
5. Set the `token` environment variable.
6. Use the token as a **Bearer Token** for all protected endpoints.

The collection includes requests for:

- Authentication
- Projects
- Tasks

---

---

## API Endpoints

### Authentication

- `POST /user` — Register a new user
- `POST /user/login` — Login
- `PATCH /user/updateMyPassword` — Update password

### Users

- `GET /user` — Get all users
- `GET /user/:id` — Get user by ID
- `PATCH /user/:id` — Update user
- `DELETE /user/:id` — Delete user

### Projects

- `GET /projects` — Get all projects
- `GET /projects/:id` — Get project by ID
- `POST /projects` — Create project
- `PATCH /projects/:id` — Update project
- `DELETE /projects/:id` — Delete project

### Tasks

- `GET /tasks` — Get all tasks
- `GET /tasks/:id` — Get task by ID
- `POST /tasks` — Create task
- `PATCH /tasks/:id` — Update task
- `DELETE /tasks/:id` — Delete task

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
