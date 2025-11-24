# PoliGrades Database Entities Documentation

This document provides comprehensive documentation for all database entities in the PoliGrades Backend system. This documentation is designed to help frontend developers understand the data structure and properly implement API integration.

## Table of Contents

1. [Enums](#enums)
2. [Core Entities](#core-entities)
3. [Authentication Entities](#authentication-entities)
4. [Academic Entities](#academic-entities)
5. [Task Management Entities](#task-management-entities)
6. [Attachment Entities](#attachment-entities)
7. [Warning System](#warning-system)
8. [Entity Relationships](#entity-relationships)
9. [TypeScript Interfaces](#typescript-interfaces)

---

## Enums

### UserRole
```typescript
type UserRole = "PROFESSOR" | "STUDENT"
```
- **PROFESSOR**: Faculty member who can create classes and manage tasks
- **STUDENT**: Student who can enroll in classes and submit assignments

---

## Core Entities

### User
Represents users in the system (both professors and students).

**Database Table:** `user`

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `id` | `number` (serial) | ✅ | ✅ (PK) | Auto-increment | Unique user identifier |
| `name` | `string` | ✅ | ❌ | - | Full name of the user |
| `email` | `string` | ✅ | ✅ | - | Email address (used for login) |
| `role` | `UserRole` | ✅ | ❌ | "STUDENT" | User role in the system |
| `createdAt` | `Date` | ✅ | ❌ | Current timestamp | Account creation date |
| `updatedAt` | `Date` | ✅ | ❌ | Auto-updated | Last profile update date |

---

## Authentication Entities

### Salt
Stores cryptographic salts for password security.

**Database Table:** `salt`

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `id` | `number` (serial) | ✅ | ✅ (PK) | Auto-increment | Unique salt identifier |
| `userId` | `number` | ✅ | ❌ | - | Foreign key to user table |
| `salt` | `string` | ✅ | ❌ | - | Cryptographic salt for password hashing |
| `createdAt` | `Date` | ✅ | ❌ | Current timestamp | Salt creation date |
| `updatedAt` | `Date` | ✅ | ❌ | Auto-updated | Last salt update date |

**Relationships:**
- `userId` → `user.id` (Many-to-One)

### Password
Stores hashed passwords for user authentication.

**Database Table:** `password`

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `id` | `number` (serial) | ✅ | ✅ (PK) | Auto-increment | Unique password identifier |
| `userId` | `number` | ✅ | ❌ | - | Foreign key to user table |
| `password` | `string` | ✅ | ❌ | - | Hashed password |
| `createdAt` | `Date` | ✅ | ❌ | Current timestamp | Password creation date |
| `updatedAt` | `Date` | ✅ | ❌ | Auto-updated | Last password update date |

**Relationships:**
- `userId` → `user.id` (Many-to-One)

---

## Academic Entities

### Subject
Represents academic subjects/courses.

**Database Table:** `subject`

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `id` | `number` (serial) | ✅ | ✅ (PK) | Auto-increment | Unique subject identifier |
| `name` | `string` | ✅ | ❌ | - | Subject name (e.g., "Mathematics", "Physics") |
| `description` | `string` | ✅ | ❌ | - | Detailed subject description |
| `color` | `string` | ✅ | ❌ | - | Primary color for UI theming (hex/rgb) |
| `accentColor` | `string` | ✅ | ❌ | - | Accent color for UI theming (hex/rgb) |
| `createdAt` | `Date` | ✅ | ❌ | Current timestamp | Subject creation date |
| `updatedAt` | `Date` | ✅ | ❌ | Auto-updated | Last subject update date |

### Class
Represents class instances of subjects taught by professors.

**Database Table:** `class`

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `id` | `number` (serial) | ✅ | ✅ (PK) | Auto-increment | Unique class identifier |
| `name` | `string` | ✅ | ❌ | - | Class name (e.g., "Math 101 - Fall 2025") |
| `subjectId` | `number` | ✅ | ❌ | - | Foreign key to subject table |
| `ownerId` | `number` | ✅ | ❌ | - | Foreign key to user table (professor) |
| `ownerName` | `string` | ✅ | ❌ | - | Cached professor name for performance |
| `createdAt` | `Date` | ✅ | ❌ | Current timestamp | Class creation date |
| `updatedAt` | `Date` | ✅ | ❌ | Auto-updated | Last class update date |

**Relationships:**
- `subjectId` → `subject.id` (Many-to-One)
- `ownerId` → `user.id` (Many-to-One, where user.role = "PROFESSOR")

### Enrollment
Links students to classes they are enrolled in.

**Database Table:** `enrollment`

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `id` | `number` (serial) | ✅ | ✅ (PK) | Auto-increment | Unique enrollment identifier |
| `studentId` | `number` | ✅ | ❌ | - | Foreign key to user table (student) |
| `classId` | `number` | ✅ | ❌ | - | Foreign key to class table |
| `createdAt` | `Date` | ✅ | ❌ | Current timestamp | Enrollment date |
| `updatedAt` | `Date` | ✅ | ❌ | Auto-updated | Last enrollment update date |

**Relationships:**
- `studentId` → `user.id` (Many-to-One, where user.role = "STUDENT")
- `classId` → `class.id` (Many-to-One)

---

## Task Management Entities

### Task
Represents assignments/tasks created by professors for their classes.

**Database Table:** `task`

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `id` | `number` (serial) | ✅ | ✅ (PK) | Auto-increment | Unique task identifier |
| `classId` | `number` | ✅ | ❌ | - | Foreign key to class table |
| `title` | `string` | ✅ | ❌ | - | Task title/name |
| `description` | `string` | ✅ | ❌ | - | Detailed task instructions |
| `hasAttachment` | `boolean` | ✅ | ❌ | `false` | Whether task has file attachments |
| `dueDate` | `Date` | ✅ | ❌ | - | Task submission deadline |
| `createdAt` | `Date` | ✅ | ❌ | Current timestamp | Task creation date |
| `updatedAt` | `Date` | ✅ | ❌ | Auto-updated | Last task update date |

**Relationships:**
- `classId` → `class.id` (Many-to-One)

### Submission
Represents student submissions for tasks.

**Database Table:** `submission`

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `id` | `number` (serial) | ✅ | ✅ (PK) | Auto-increment | Unique submission identifier |
| `taskId` | `number` | ✅ | ❌ | - | Foreign key to task table |
| `studentId` | `number` | ✅ | ❌ | - | Foreign key to user table (student) |
| `hasAttachment` | `boolean` | ✅ | ❌ | `false` | Whether submission has file attachments |
| `submittedAt` | `Date` | ✅ | ❌ | Current timestamp | Submission timestamp |
| `graded` | `boolean` | ✅ | ❌ | `false` | Whether submission has been graded |
| `grade` | `string \| null` | ❌ | ❌ | `null` | Grade assigned (decimal/text format) |
| `createdAt` | `Date` | ✅ | ❌ | Current timestamp | Submission creation date |
| `updatedAt` | `Date` | ✅ | ❌ | Auto-updated | Last submission update date |

**Relationships:**
- `taskId` → `task.id` (Many-to-One)
- `studentId` → `user.id` (Many-to-One, where user.role = "STUDENT")

---

## Attachment Entities

### TaskAttachment
Represents files attached to tasks by professors.

**Note:** This entity is defined in interfaces but not in the database schema. It may be implemented as a separate table or handled through file system references.

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `id` | `number` | ✅ | ✅ (PK) | Unique attachment identifier |
| `taskId` | `number` | ✅ | ❌ | Foreign key to task table |
| `fileName` | `string` | ✅ | ❌ | Original file name |
| `filePath` | `string` | ✅ | ❌ | Server file path |
| `createdAt` | `Date` | ✅ | ❌ | Attachment upload date |
| `updatedAt` | `Date` | ✅ | ❌ | Last attachment update date |

**Relationships:**
- `taskId` → `task.id` (Many-to-One)

### SubmissionAttachment
Represents files attached to submissions by students.

**Note:** This entity is defined in interfaces but not in the database schema. It may be implemented as a separate table or handled through file system references.

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `id` | `number` | ✅ | ✅ (PK) | Unique attachment identifier |
| `submissionId` | `number` | ✅ | ❌ | Foreign key to submission table |
| `fileName` | `string` | ✅ | ❌ | Original file name |
| `filePath` | `string` | ✅ | ❌ | Server file path |
| `createdAt` | `Date` | ✅ | ❌ | Attachment upload date |
| `updatedAt` | `Date` | ✅ | ❌ | Last attachment update date |

**Relationships:**
- `submissionId` → `submission.id` (Many-to-One)

---

## Warning System

### Warning
Represents system warnings or notifications for users.

**Note:** This entity is defined in interfaces but not in the database schema. It may be implemented as a separate table or handled through a different mechanism.

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `userID` | `number` | ✅ | ❌ | User who should receive the warning |
| `subjectId` | `string` | ✅ | ❌ | Related subject identifier |
| `userName` | `string` | ✅ | ❌ | Cached user name |
| `subjectName` | `string` | ✅ | ❌ | Cached subject name |
| `title` | `string` | ✅ | ❌ | Warning title |
| `description` | `string` | ✅ | ❌ | Warning description |
| `timestamp` | `Date` | ✅ | ❌ | Warning creation time |

---

## Entity Relationships

```mermaid
erDiagram
    USER ||--o{ SALT : has
    USER ||--o{ PASSWORD : has
    USER ||--o{ CLASS : owns
    USER ||--o{ ENROLLMENT : enrolled_in
    USER ||--o{ SUBMISSION : submits
    
    SUBJECT ||--o{ CLASS : contains
    
    CLASS ||--o{ ENROLLMENT : has
    CLASS ||--o{ TASK : contains
    
    TASK ||--o{ SUBMISSION : receives
    TASK ||--o{ TASK_ATTACHMENT : has
    
    SUBMISSION ||--o{ SUBMISSION_ATTACHMENT : has
    
    USER {
        number id PK
        string name
        string email UK
        UserRole role
        Date createdAt
        Date updatedAt
    }
    
    SUBJECT {
        number id PK
        string name
        string description
        string color
        string accentColor
        Date createdAt
        Date updatedAt
    }
    
    CLASS {
        number id PK
        string name
        number subjectId FK
        number ownerId FK
        string ownerName
        Date createdAt
        Date updatedAt
    }
    
    ENROLLMENT {
        number id PK
        number studentId FK
        number classId FK
        Date createdAt
        Date updatedAt
    }
    
    TASK {
        number id PK
        number classId FK
        string title
        string description
        boolean hasAttachment
        Date dueDate
        Date createdAt
        Date updatedAt
    }
    
    SUBMISSION {
        number id PK
        number taskId FK
        number studentId FK
        boolean hasAttachment
        Date submittedAt
        boolean graded
        string grade
        Date createdAt
        Date updatedAt
    }
```

---

## TypeScript Interfaces

The system provides TypeScript interfaces that mirror the database entities. These interfaces are available in the `src/interfaces/` directory:

### Core Interfaces
- `IUser` - User entity interface
- `ISubject` - Subject entity interface  
- `IClass` - Class entity interface
- `IEnrollment` - Enrollment entity interface

### Task Management Interfaces
- `ITask` - Task entity interface
- `ISubmission` - Submission entity interface

### Attachment Interfaces
- `ITaskAttachment` - Task attachment interface
- `ISubmissionAttachment` - Submission attachment interface

### System Interfaces
- `IWarning` - Warning system interface
- `IMessage` - Message interface
- `IHandlerReturn` - API response interface
- `IDatabase` - Database interface

---

## Frontend Integration Notes

### Date Handling
- All timestamp fields (`createdAt`, `updatedAt`, `dueDate`, `submittedAt`) are stored as PostgreSQL timestamps
- Frontend should expect ISO 8601 date strings when receiving data from the API
- When sending dates to the API, use ISO 8601 format

### ID References
- All `id` fields are auto-incrementing integers
- Foreign key relationships use integer IDs
- Frontend should store IDs as numbers, not strings

### Boolean Fields
- `hasAttachment`, `graded` fields are stored as PostgreSQL booleans
- Frontend will receive `true`/`false` values

### Nullable Fields
- `grade` field in submissions can be `null` until graded
- Frontend should handle null values appropriately

### Enums
- `UserRole` is stored as PostgreSQL enum with values "PROFESSOR" or "STUDENT"
- Frontend should use these exact string values

### Colors
- `color` and `accentColor` fields in subjects expect color values (hex, rgb, etc.)
- Frontend should validate color formats before sending to API

---

## API Response Examples

### User Object
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "role": "STUDENT",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### Class Object
```json
{
  "id": 1,
  "name": "Advanced Mathematics",
  "subjectId": 2,
  "ownerId": 5,
  "ownerName": "Dr. Jane Smith",
  "createdAt": "2025-01-15T08:00:00.000Z",
  "updatedAt": "2025-01-15T08:00:00.000Z"
}
```

### Task Object
```json
{
  "id": 1,
  "classId": 1,
  "title": "Linear Algebra Assignment",
  "description": "Complete exercises 1-15 from chapter 3",
  "hasAttachment": true,
  "dueDate": "2025-01-25T23:59:59.000Z",
  "createdAt": "2025-01-15T14:00:00.000Z",
  "updatedAt": "2025-01-15T14:00:00.000Z"
}
```

### Submission Object
```json
{
  "id": 1,
  "taskId": 1,
  "studentId": 3,
  "hasAttachment": true,
  "submittedAt": "2025-01-20T16:45:00.000Z",
  "graded": true,
  "grade": "8.5",
  "createdAt": "2025-01-20T16:45:00.000Z",
  "updatedAt": "2025-01-22T09:30:00.000Z"
}
```

---

*This documentation was generated on November 23, 2025. Please keep it updated as the database schema evolves.*
