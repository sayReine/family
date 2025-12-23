# Family Tree Application

A comprehensive full-stack web application for managing and visualizing family genealogy, built with React, TypeScript, Express, and Prisma.

## Features

- **Authentication System**: Secure user registration and login with JWT tokens
- **Family Tree Visualization**: Interactive family tree with visual connections between generations
- **Member Management**: Add, edit, and manage family members with detailed profiles
- **Generational View**: Browse family members organized by generations
- **Multi-step Registration**: Comprehensive onboarding with user credentials and personal information
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-friendly interface with collapsible sidebar

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS 4** - Utility-first styling
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Node.js** with Express
- **TypeScript** - Type-safe backend
- **Prisma ORM** - Database management
- **PostgreSQL/Neon** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **CORS** - Cross-origin resource sharing

## Project Structure

```
.
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── auth/            # Authentication components
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth, Theme)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── package.json
│
└── backend/
    ├── prisma/              # Database schema
    ├── server.ts            # Express server
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or Neon serverless)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd family-tree-app
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Backend Environment Variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="your-postgresql-connection-string"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```

2. **Frontend Environment Variables**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

3. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The API will run on `http://localhost:3000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The app will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/link-person` - Link user to person profile

### Persons
- `GET /api/persons` - Get all persons
- `GET /api/persons/:id` - Get person by ID
- `POST /api/persons` - Create new person
- `PUT /api/persons/:id` - Update person
- `DELETE /api/persons/:id` - Delete person
- `POST /api/persons/marriages` - Create marriage relationship

## User Roles

- **ADMIN** - Full access to all features
- **MEMBER** - Can view and edit family data
- **GUEST** - Read-only access

## Authentication Flow

1. User registers with email and password
2. Multi-step form collects personal information
3. JWT token issued upon successful registration/login
4. Token stored in localStorage
5. Protected routes require valid token
6. Token automatically included in API requests

## Features in Detail

### Family Tree Visualization
- Visual representation of family relationships
- Horizontal connectors between spouses
- Vertical connectors showing parent-child relationships
- Person cards with photos and basic information

### Member Profiles
Each member profile includes:
- Basic information (name, nicknames, maiden name)
- Demographics (gender, date of birth)
- Contact information (email, phone, address)
- Biography and occupation
- Family relationships (parents, spouse, children)

### Theme Support
- Light and dark mode toggle
- Persisted theme preference in localStorage
- Consistent styling across all components

## Development

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm run build
```

### Testing
```bash
cd backend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Built with modern React best practices
- Utilizes Prisma for type-safe database access
- Styled with Tailwind CSS for rapid development
- Icons provided by Lucide React

## Support

For issues and questions, please open an issue on the repository.

---

**© 2025 My Family**