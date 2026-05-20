# Backend Architecture - Her Mind Safe Space

## Project Structure

```
backend/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   ├── users/                # Users module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── dto/
│   │       └── update-profile.dto.ts
│   ├── mood/                 # Mood tracking module
│   │   ├── mood.controller.ts
│   │   ├── mood.service.ts
│   │   ├── mood.module.ts
│   │   └── dto/
│   │       └── create-mood-entry.dto.ts
│   ├── journal/              # Journal module
│   │   ├── journal.controller.ts
│   │   ├── journal.service.ts
│   │   ├── journal.module.ts
│   │   └── dto/
│   │       └── create-journal-entry.dto.ts
│   ├── chat/                 # Chat module
│   │   ├── chat.controller.ts
│   │   ├── chat.service.ts
│   │   ├── chat.module.ts
│   │   └── dto/
│   │       └── create-chat-message.dto.ts
│   ├── prisma/               # Database service
│   │   └── prisma.service.ts
│   ├── app.module.ts         # Root module
│   └── main.ts               # Entry point
├── prisma/
│   └── schema.prisma         # Database schema
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── .env.example              # Environment variables example
└── API_DOCUMENTATION.md      # API endpoints documentation
```

## Technology Stack

- **Framework**: NestJS 10.3.0
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) with Passport
- **Validation**: class-validator and class-transformer
- **Password Hashing**: bcrypt
- **Config Management**: @nestjs/config

## Key Features

### 1. Authentication Module

- User registration with email and password
- Login with JWT token generation
- Protected endpoints using JWT guard
- Password hashing with bcrypt

### 2. Users Module

- User profile management
- Update profile information
- Language and preference management
- Emotional goals and stress triggers tracking

### 3. Mood Tracking Module

- Create mood entries with intensity levels
- Track triggers and activities
- Get mood statistics
- Filter by date range

### 4. Journal Module

- Create and manage journal entries
- Search functionality
- Filter by mood
- Privacy controls (private/public entries)
- Tag-based organization

### 5. Chat Module

- Create and store chat messages
- Support for different message types (support, emergency, general)
- Chat history retrieval
- Emergency message tracking
- Message deletion

## Database Schema

### Core Models

- **User**: Stores email, password hash, and metadata
- **Profile**: Extended user information (name, age, country, preferences)
- **UserRole**: Role-based access control

### Feature Models

- **MoodEntry**: Daily mood tracking with intensity and notes
- **JournalEntry**: Personal journal entries with tags and mood association
- **ChatMessage**: Conversation history with type classification

## Environment Variables

```
# Backend Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hermind_db

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRATION=3600

# Frontend
FRONTEND_URL=http://localhost:5173

# CORS Settings
CORS_ORIGIN=http://localhost:5173
```

## Running the Backend

### Development

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

### Production Build

```bash
npm run build
npm start
```

### Database Management

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (GUI)
npm run prisma:studio
```

## API Endpoints Overview

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Users

- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update user profile

### Mood

- `POST /mood/entries` - Create mood entry
- `GET /mood/entries` - Get all mood entries
- `GET /mood/entries/:id` - Get specific mood entry
- `PATCH /mood/entries/:id` - Update mood entry
- `DELETE /mood/entries/:id` - Delete mood entry
- `GET /mood/stats` - Get mood statistics

### Journal

- `POST /journal/entries` - Create journal entry
- `GET /journal/entries` - Get all journal entries
- `GET /journal/entries/search` - Search journal entries
- `GET /journal/entries/mood/:mood` - Get entries by mood
- `GET /journal/entries/:id` - Get specific entry
- `PATCH /journal/entries/:id` - Update entry
- `DELETE /journal/entries/:id` - Delete entry

### Chat

- `POST /chat/messages` - Create chat message
- `GET /chat/history` - Get chat history
- `GET /chat/latest` - Get latest messages
- `GET /chat/emergency` - Get emergency messages
- `DELETE /chat/messages/:id` - Delete message
- `DELETE /chat/history` - Clear chat history

## Authentication Flow

1. User registers with email and password
2. Password is hashed using bcrypt
3. User account and profile are created
4. JWT token is generated and returned
5. Frontend stores token in localStorage
6. All requests include token in Authorization header
7. JWT guard validates token on protected routes

## Error Handling

- **400 Bad Request**: Invalid input or business logic violation
- **401 Unauthorized**: Invalid credentials or missing token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server-side error

## Security Best Practices

1. **Password Security**: Passwords are hashed with bcrypt (10 salt rounds)
2. **JWT Secret**: Use strong random secret in production
3. **CORS**: Configured to allow frontend domain only
4. **Validation**: All inputs validated with class-validator
5. **Authorization**: All feature endpoints require JWT authentication
6. **Data Privacy**: Users can only access their own data

## Adding New Modules

To add a new feature module:

1. Create module folder: `src/feature/`
2. Create service: `feature.service.ts`
3. Create controller: `feature.controller.ts`
4. Create DTO files: `dto/create-feature.dto.ts`
5. Create module: `feature.module.ts`
6. Add to AppModule imports

Example structure:

```typescript
@Module({
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
```

## Performance Considerations

- Database indexes on frequently queried fields (userId, createdAt)
- Cascade delete for data integrity
- Pagination support for large datasets
- Query optimization with select/include

## Future Enhancements

- Rate limiting for API endpoints
- WebSocket support for real-time chat
- File upload for journal entries
- Social features (friend connections)
- Advanced analytics
- Email notifications
- Two-factor authentication
