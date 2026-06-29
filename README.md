# CollabCode - Real-Time Collaborative Code Editor

A modern, full-stack real-time collaborative coding platform built as a startup-style prototype using the **MERN stack**.

![Demo](https://via.placeholder.com/800x400?text=CollabCode+Demo)

##  Features

- **Real-time Code Collaboration** using Socket.io + Monaco Editor
- **User Authentication** (Email/Password + Google OAuth ready)
- **Project Management** with invite links and room codes
- **Live Chat** within projects
- **Code Execution** using Judge0 API (JavaScript, Python, Java, C++)
- **Manual Save** + **Version History**
- **Presence Tracking** (see who's online)
- **Responsive UI** with Tailwind CSS

##  Tech Stack

### Frontend
- React.js + Vite
- Monaco Editor
- Socket.io Client
- Tailwind CSS
- Zustand (State Management)
- React Router

### Backend
- Node.js + Express
- Socket.io
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

### External Services
- Judge0 (Code Execution)
- MongoDB Atlas

##  Quick Start

### Prerequisites
- Node.js
- MongoDB Atlas account

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/collabcode.git
cd collabcode

# Backend setup
cd server
npm install
cp .env.example .env
# Add your MONGO_URI and JWT_SECRET

# Frontend setup
cd ../client
npm install

# Run both
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev


Project Structure
textcollabcode/
├── server/          # Backend (Express + Socket.io)
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── sockets/
│   └── server.js
└── client/          # Frontend (React)
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── store/
    │   └── lib/


Key Highlights

Real-time collaboration using WebSockets (room-based)
Clean separation between real-time state and persisted data
Manual save system (no auto-save on every keystroke)
Last-Write-Wins conflict resolution (simple & effective for prototype)
Fully protected routes and socket authentication


Future Enhancements

Operational Transformation / CRDTs for better conflict resolution
Multi-file support
File tree and folder structure
Deployment (Vercel + Render)
Google OAuth full implementation


Learning Outcomes

Real-time systems with Socket.io
Advanced React patterns
Authentication & Authorization
Database design with access control
Collaborative editing concepts