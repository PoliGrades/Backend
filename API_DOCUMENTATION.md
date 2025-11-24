# PoliGrades API Documentation

This document provides comprehensive documentation for all API endpoints in the PoliGrades Backend application.

## Base URL
All endpoints are prefixed with the base URL of your server.

## Authentication
Most endpoints require JWT authentication. The JWT token should be sent as an HTTP-only cookie named `token`.

## Response Format
All responses follow this general format:
```json
{
  "message": "Success message (optional)",
  "data": "Response data (varies by endpoint)",
  "error": "Error message (only on error responses)"
}
```

---

## Authentication Routes (`/auth`)

### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "string (required) - User's full name",
  "email": "string (required) - Email ending with @p4ed.com.br",
  "role": "PROFESSOR | STUDENT (required) - User role",
  "password": "string (required) - User password"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "data": {
    "id": "number - User ID",
    "name": "string - User name",
    "email": "string - User email",
    "role": "string - User role"
  }
}
```

**Validation Rules:**
- Email must end with `@p4ed.com.br`
- Role must be either `PROFESSOR` or `STUDENT`

---

### POST `/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "string (required) - User email",
  "password": "string (required) - User password"
}
```

**Response (200):**
```json
{
  "name": "string - User name",
  "email": "string - User email", 
  "role": "string - User role",
  "id": "number - User ID"
}
```

**Error Response (401):**
```json
{
  "error": "Email ou senha inválidos."
}
```

---

### POST `/auth/logout`
Logout and clear authentication token.

**Authentication:** Required

**Request Body:** None

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## User Routes

### GET `/professors`
Get all professors.

**Authentication:** Required

**Request Body:** None

**Response (200):**
```json
[
  {
    "id": "number - Professor ID",
    "name": "string - Professor name",
    "email": "string - Professor email",
    "role": "PROFESSOR"
  }
]
```

---

### GET `/students`
Get all students.

**Authentication:** Required

**Request Body:** None

**Response (200):**
```json
[
  {
    "id": "number - Student ID",
    "name": "string - Student name",
    "email": "string - Student email", 
    "role": "STUDENT"
  }
]
```

---

## Subject Routes (`/subject` or `/subjects`)

### POST `/subject`
Create a new subject.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string (required) - Subject name",
  "description": "string (required) - Subject description",
  "color": "string (required) - Primary color for the subject",
  "accentColor": "string (required) - Accent color for the subject"
}
```

**Response (201):**
```json
{
  "name": "string - Subject name",
  "description": "string - Subject description",
  "color": "string - Primary color",
  "accentColor": "string - Accent color",
  "id": "number - Subject ID"
}
```

---

### GET `/subject`
Get all subjects.

**Authentication:** Required

**Request Body:** None

**Response (200):**
```json
[
  {
    "id": "number - Subject ID",
    "name": "string - Subject name",
    "description": "string - Subject description",
    "color": "string - Primary color",
    "accentColor": "string - Accent color"
  }
]
```

---

### GET `/subject/professor/my-subjects`
Get subjects assigned to the authenticated professor.

**Authentication:** Required (Professor role only)

**Request Body:** None

**Response (200):**
```json
[
  {
    "id": "number - Subject ID",
    "name": "string - Subject name",
    "description": "string - Subject description",
    "color": "string - Primary color",
    "accentColor": "string - Accent color"
  }
]
```

**Error Response (403):**
```json
{
  "error": "Only professors can access this endpoint"
}
```

---

### GET `/subject/:id`
Get a specific subject by ID.

**Authentication:** Required

**URL Parameters:**
- `id` (number) - Subject ID

**Request Body:** None

**Response (200):**
```json
{
  "id": "number - Subject ID",
  "name": "string - Subject name", 
  "description": "string - Subject description",
  "color": "string - Primary color",
  "accentColor": "string - Accent color",
  "createdAt": "date - Creation timestamp",
  "updatedAt": "date - Update timestamp"
}
```

**Error Response (404):**
```json
{
  "error": "Subject not found"
}
```

---

## Class Routes (`/class` or `/classes`)

### GET `/class`
Get all classes.

**Authentication:** Required

**Request Body:** None

**Response (200):**
```json
[
  {
    "id": "number - Class ID",
    "name": "string - Class name",
    "subjectId": "number - Associated subject ID"
  }
]
```

---

### POST `/class`
Create a new class.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string (required) - Class name",
  "subjectId": "number (required) - Associated subject ID"
}
```

**Response (201):**
```json
{
  "name": "string - Class name",
  "subjectId": "number - Associated subject ID",
  "id": "number - Class ID"
}
```

---

### GET `/class/subject/:subjectId`
Get all classes for a specific subject.

**Authentication:** Required

**URL Parameters:**
- `subjectId` (number) - Subject ID

**Request Body:** None

**Response (200):**
```json
[
  {
    "id": "number - Class ID",
    "name": "string - Class name",
    "subjectId": "number - Associated subject ID"
  }
]
```

---

## Enrollment Routes (`/enrollment` or `/enrollments`)

### POST `/enrollment`
Enroll a student in a class.

**Authentication:** Required

**Request Body:**
```json
{
  "studentId": "number (required) - Student ID to enroll",
  "classId": "number (required) - Class ID to enroll in"
}
```

**Response (201):**
```json
{
  "id": "number - Enrollment ID",
  "studentId": "number - Student ID",
  "classId": "number - Class ID"
}
```

---

## Task Routes (`/task` or `/tasks`)

### POST `/task`
Create a new task with optional file attachments.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**
- `body` (string, required) - JSON string containing task data:
  ```json
  {
    "classId": "number (required) - Class ID",
    "title": "string (required) - Task title",
    "description": "string (required) - Task description", 
    "dueDate": "string (required) - Due date in ISO format"
  }
  ```
- `attachments` (files, optional) - Array of file attachments

**Response (201):**
```json
{
  "classId": "number - Class ID",
  "title": "string - Task title",
  "description": "string - Task description",
  "dueDate": "date - Due date",
  "id": "number - Task ID"
}
```

---

### GET `/task`
Get all tasks for the authenticated user.

**Authentication:** Required

**Request Body:** None

**Response (200):**
```json
[
  {
    "id": "number - Task ID",
    "classId": "number - Class ID",
    "title": "string - Task title",
    "description": "string - Task description",
    "dueDate": "date - Due date"
  }
]
```

---

### GET `/task/subject/:subjectId`
Get all tasks for a specific subject.

**Authentication:** Required

**URL Parameters:**
- `subjectId` (number) - Subject ID

**Request Body:** None

**Response (200):**
```json
[
  {
    "id": "number - Task ID",
    "classId": "number - Class ID",
    "title": "string - Task title",
    "description": "string - Task description",
    "dueDate": "date - Due date"
  }
]
```

---

### GET `/task/:id`
Get a specific task by ID with attachments.

**Authentication:** Required

**URL Parameters:**
- `id` (number) - Task ID

**Request Body:** None

**Response (200):**
```json
{
  "id": "number - Task ID",
  "classId": "number - Class ID", 
  "title": "string - Task title",
  "description": "string - Task description",
  "dueDate": "date - Due date",
  "attachments": "array - Task attachments"
}
```

**Error Response (404):**
```json
{
  "error": "Task not found"
}
```

---

### POST `/task/:id/submit`
Submit a task with optional file attachments.

**Authentication:** Required

**URL Parameters:**
- `id` (number) - Task ID

**Content-Type:** `multipart/form-data`

**Request Body:**
- `attachments` (files, optional) - Array of file attachments

**Response (200):**
```json
{
  "message": "Submission successful"
}
```

---

### GET `/task/:id/submissions`
Get all submissions for a specific task.

**Authentication:** Required

**URL Parameters:**
- `id` (number) - Task ID

**Request Body:** None

**Response (200):**
```json
[
  {
    "id": "number - Submission ID",
    "taskId": "number - Task ID",
    "studentId": "number - Student ID",
    "submittedAt": "date - Submission timestamp",
    "attachments": "array - Submission attachments"
  }
]
```

---

### POST `/task/:id/grade`
Grade a task submission.

**Authentication:** Required

**URL Parameters:**
- `id` (number) - Submission ID (not task ID)

**Request Body:**
```json
{
  "grade": "number (required) - Grade value"
}
```

**Response (200):**
```json
{
  "message": "Grading successful"
}
```

---

## Warning Routes (`/warning` or `/warnings`)

### POST `/warning`
Create a new warning.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "string (required) - Warning title",
  "description": "string (required) - Warning description",
  "subjectId": "number (required) - Associated subject ID"
}
```

**Response (201):**
```json
{
  "userID": "number - User ID who created the warning",
  "subjectId": "number - Associated subject ID", 
  "subjectName": "string - Subject name",
  "userName": "string - User name who created the warning",
  "title": "string - Warning title",
  "description": "string - Warning description",
  "timestamp": "date - Creation timestamp"
}
```

**Error Response (404):**
```json
{
  "error": "Subject not found"
}
```

---

### GET `/warning`
Get all warnings.

**Authentication:** Required

**Request Body:** None

**Response (200):**
```json
[
  {
    "userID": "number - User ID who created the warning",
    "subjectId": "number - Associated subject ID",
    "subjectName": "string - Subject name", 
    "userName": "string - User name who created the warning",
    "title": "string - Warning title",
    "description": "string - Warning description",
    "timestamp": "date - Creation timestamp"
  }
]
```

---

## File Routes (`/files`)

### GET `/files/download/:filename`
Download a file by filename.

**Authentication:** Not required

**URL Parameters:**
- `filename` (string) - Name of the file to download

**Request Body:** None

**Response:** File download or error message

**Error Response (500):**
```json
{
  "message": "File download failed",
  "error": "Error description"
}
```

---

## Error Responses

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Validation Error Response (400)
When request body validation fails:
```json
{
  "error": [
    {
      "code": "validation_error_code",
      "expected": "expected_value_type",
      "received": "received_value_type", 
      "path": ["field_name"],
      "message": "Validation error message"
    }
  ]
}
```

---

## Notes

1. **File Uploads**: Endpoints that accept file uploads use `multipart/form-data` encoding.

2. **Date Formats**: All dates should be in ISO 8601 format (e.g., `2023-12-25T10:30:00Z`).

3. **Authentication**: JWT tokens are stored as HTTP-only cookies for security.

4. **Role-based Access**: Some endpoints are restricted to specific user roles (PROFESSOR or STUDENT).

5. **Email Validation**: User emails must end with `@p4ed.com.br` domain.

6. **Route Aliases**: Most routes have both singular and plural aliases (e.g., `/task` and `/tasks` point to the same endpoints).

7. **File Storage**: Uploaded files are stored in the `uploads/` directory on the server.
