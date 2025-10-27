# 🎨 Creator Portfolio Platform

A comprehensive MERN-based platform for musicians, photographers, and other creators to showcase their portfolios, connect with other creators, and build professional networks.

## ✨ Features

### Core Features
- **Dynamic Profile Management**: Role-specific layouts for Musicians & Photographers
- **Public URLs**: `/profile/username` for every creator
- **Portfolio System**: Cloudinary integration with media uploads
- **Role-Based Connections**: Musicians ↔ Musicians, Photographers ↔ Photographers
- **Advanced Search & Discovery**: Filter by category, experience, location
- **Private Messaging**: Feedback system without public comments
- **Admin Dashboard**: User management, content moderation, analytics

### Advanced Features
- **"Book Me" Gateway**: Direct service booking system
- **Digital Storefront**: Sell digital products (presets, tracks, etc.)
- **AI Collaboration Matchmaker**: Smart partner suggestions
- **Creator Analytics**: Performance metrics and insights
- **Gigs Board**: Job opportunities for creators
- **Collaboration Projects**: Full project management
- **Verified Credentials**: Testimonials and achievement system

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** Authentication
- **Passport.js** (Google OAuth)
- **Cloudinary** for media storage
- **Redis** for session management
- **Winston** for logging
- **Helmet** for security

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls
- **React Query** for state management

### DevOps
- **Docker** & Docker Compose
- **Nginx** reverse proxy
- **Environment** configuration

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Redis (optional)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd creator-portfolio-platform
   ```

2. **Run the setup script**
   ```bash
   node setup.js
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

### Manual Setup

1. **Install dependencies**
   ```bash
   # Root dependencies
   npm install
   
   # Server dependencies
   cd server && npm install
   
   # Client dependencies
   cd client && npm install --legacy-peer-deps
   ```

2. **Environment Configuration**
   
   Create `server/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/creator-portfolio
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   SESSION_SECRET=your-session-secret
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```
   
   Create `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_APP_NAME=Creator Portfolio Platform
   ```

3. **Start the services**
   ```bash
   # Start server (from server directory)
   npm run dev
   
   # Start client (from client directory)
   npm run dev
   ```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:5173/admin
- **API Health**: http://localhost:5000/health

## 📱 Pages & Routes

- `/` - Home page with beautiful landing
- `/discover` - Enhanced creator discovery
- `/profile/:userId` - Dynamic role-based profiles
- `/gigs` - Gigs and opportunities board
- `/collaborations` - AI-powered collaboration matching
- `/messages` - Private messaging system
- `/analytics` - Creator performance insights
- `/admin` - Enhanced admin dashboard

## 🎨 UI/UX Features

- **Beautiful Animations**: Framer Motion throughout
- **Modern Design**: Glassmorphism, gradients, smooth transitions
- **Responsive Layout**: Perfect on all devices
- **Role-Specific Themes**: 
  - 🎵 **Musicians**: Purple/pink gradients with audio focus
  - 📸 **Photographers**: Blue/cyan gradients with visual focus

## 🔒 Security Features

- **Input Sanitization**: DOMPurify and validator
- **Rate Limiting**: Comprehensive API protection
- **Error Handling**: Graceful error management
- **JWT Authentication**: Secure token-based auth
- **CORS Protection**: Configured for production
- **Helmet Security**: HTTP security headers

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Portfolio
- `GET /api/creator/portfolio` - Get user's portfolio
- `POST /api/creator/portfolio` - Create portfolio item
- `PUT /api/creator/portfolio/:id` - Update portfolio item
- `DELETE /api/creator/portfolio/:id` - Delete portfolio item

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `PATCH /api/messages/:id/read` - Mark as read

### Gigs
- `GET /api/gigs` - Get all gigs
- `POST /api/gigs` - Create gig
- `POST /api/gigs/:id/apply` - Apply to gig

### Collaborations
- `GET /api/collaborations` - Get collaborations
- `POST /api/collaborations` - Create collaboration
- `POST /api/collaborations/request` - Send collaboration request

### AI Features
- `GET /api/ai/collaboration-matches` - Get AI matches
- `GET /api/ai/analytics/:userId` - Get user analytics

### Admin
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/role` - Update user role
- `GET /api/admin/stats` - Get platform statistics

## 🐳 Docker Deployment

1. **Build and start services**
   ```bash
   docker-compose up -d
   ```

2. **Stop services**
   ```bash
   docker-compose down
   ```

## 🧪 Testing

```bash
# Server tests
cd server && npm test

# Client tests
cd client && npm test

# All tests
npm test
```

## 📈 Performance

- **Code Splitting**: Lazy loading for better performance
- **Image Optimization**: Cloudinary integration
- **Caching**: Redis for session management
- **Compression**: Gzip compression enabled
- **Bundle Analysis**: Vite bundle analyzer

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@creatorportfolio.com or create an issue in the repository.

## 🎉 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS
- Framer Motion for smooth animations
- MongoDB for the flexible database
- All the open-source contributors

---

**Made with ❤️ for creators worldwide**