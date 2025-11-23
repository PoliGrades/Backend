# PoliGrades Backend - Refactored Structure

## Project Structure

The backend has been refactored to improve maintainability, organization, and
scalability. Here's the new structure:

### Core Files

- **`src/main.ts`** - Main entry point, now simplified and focused on
  bootstrapping
- **`src/config/environment.ts`** - Centralized configuration management
- **`src/middleware/setup.ts`** - Middleware configuration
- **`src/utils/errorHandler.ts`** - Global error handling utilities
- **`src/utils/upload.ts`** - File upload utility functions

### Services

- **`src/services/serviceContainer.ts`** - Service factory and dependency
  injection
- All existing services remain in their original locations

### Routes

- **`src/routes/index.ts`** - Route configuration and setup
- **`src/routes/auth.ts`** - Authentication routes
- **`src/routes/tasks.ts`** - Task management routes
- **`src/routes/subjects.ts`** - Subject management routes
- **`src/routes/classes.ts`** - Class management routes
- **`src/routes/warnings.ts`** - Warning system routes
- **`src/routes/users.ts`** - User management routes

### WebSocket

- **`src/socket/websocket.ts`** - Socket.io configuration and event handling

## Key Improvements

### 1. **Separation of Concerns**

- Routes are now separated by domain (auth, tasks, subjects, etc.)
- Middleware setup is extracted to its own module
- Configuration is centralized
- Error handling is standardized

### 2. **Better Error Handling**

- Centralized error handling with proper HTTP status codes
- Async error wrapper for cleaner route handlers
- Development vs production error details

### 3. **Improved Configuration**

- Environment variables are properly validated
- Configuration is type-safe
- Centralized configuration access

### 4. **Dependency Injection**

- Service container pattern for better testability
- Cleaner service instantiation
- Better separation between services and routes

### 5. **Cleaner Route Handlers**

- Removed repetitive error handling code
- Standardized response patterns
- Better type safety

## Environment Variables

Make sure to set these environment variables:

```env
ENVIRONMENT=development|production
SECRET_KEY=your-secret-key
UPLOADS_DIR=./uploads (optional)
PORT=3000 (optional)
```

## Running the Application

The application entry point remains the same:

```bash
deno task start
# or
deno run --allow-all src/main.ts
```

## Benefits of the Refactoring

1. **Maintainability**: Code is better organized and easier to understand
2. **Scalability**: Adding new routes/features is now more straightforward
3. **Testing**: Services are properly isolated and can be easily mocked
4. **Error Handling**: Consistent error handling across the application
5. **Configuration**: Centralized and type-safe configuration management
6. **Code Reuse**: Common patterns are extracted into reusable utilities

The refactoring maintains full backward compatibility while significantly
improving the codebase structure.
