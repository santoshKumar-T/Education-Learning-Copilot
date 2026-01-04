# 🎓 Education & Learning Copilot

An AI-powered educational assistant with chatbot capabilities, authentication, and session management.

## ✨ Features

- 🤖 **AI Chatbot** - Powered by OpenAI GPT-3.5-turbo
- 🔐 **Authentication** - User registration and login with JWT
- 💾 **Session Management** - Persistent conversations with MongoDB
- 🧠 **LangChain Integration** - Advanced memory management
- 📱 **Modern UI** - React + Vite frontend
- 🚀 **Production Ready** - Deployed on Vercel + Railway

## 🚀 Quick Start

### Local Development

#### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API Key

#### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/santoshKumar-T/Education-Learning-Copilot.git
   cd Education-Learning-Copilot
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.template .env
   # Edit .env and add your OPENAI_API_KEY and MONGODB_URI
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the app**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📦 Tech Stack

### Frontend
- React 18
- Vite
- Modern CSS

### Backend
- Node.js + Express
- MongoDB + Mongoose
- OpenAI API
- LangChain.js
- JWT Authentication

## 🌐 Deployment

This project is configured for deployment on:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: MongoDB (Railway or Atlas)

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## 📚 Documentation

- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `QUICK_DEPLOY.md` - 15-minute quick start
- `DEPLOYMENT_SUMMARY.md` - Deployment overview

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/education_copilot
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_secret_here
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

### Frontend
```env
VITE_API_URL=http://localhost:5000
```

## 📝 License

ISC

## 👤 Author

santoshKumar-T

