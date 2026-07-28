# Team Task Management Application

A full-stack task board management application built with a Node.js/Express REST backend, Socket.io for real-time synchronization, and a React (Vite) + Bootstrap 5 frontend.

---

## Tech Stack

- **Backend**: Node.js, Express.js, Socket.io, MongoDB (Mongoose ORM)
- **Frontend**: React, Bootstrap 5, Bootstrap Icons, Socket.io-client, React Router DOM, React Hot Toast
- **Database**: MongoDB (Supports local instances and MongoDB Atlas)
- **Testing Frameworks**: Node.js & Supertest (Backend), Vitest (Frontend)

---

## Environment Configuration

Create a `.env` file inside `Management-Application-BackEnd` using `.env.example`:

```env
PORT=3000
SECRET=my_jwt_api_secret
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/managementApplication
```

---

## Project Setup & Execution

### 1. Backend Service
```bash
cd Management-Application-BackEnd
npm install
npm start
```
App runs on `http://localhost:3000`.

### 2. Frontend Web App
```bash
cd Management-Application-FrontEnd
npm install
npm run dev
```
App runs on `http://localhost:5173`.

---

## Automated Testing

- **Run Backend Integration Tests** (Make sure backend is running first using `npm start`):
  ```bash
  cd Management-Application-BackEnd
  npm test
  ```

- **Run Frontend Unit Tests**:
  ```bash
  cd Management-Application-FrontEnd
  npm test
  ```
