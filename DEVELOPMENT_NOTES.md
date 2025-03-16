# GRC CMMC Application Development Notes

This document provides detailed information for developers working on the GRC CMMC application.

## Architecture Overview

The application follows a standard client-server architecture:

- **Frontend**: Angular 15+ single-page application
- **Backend**: Node.js with Express RESTful API
- **Database**: PostgreSQL relational database
- **Authentication**: JWT-based authentication with refresh tokens

## Organization Management

### Database Schema

The organization management system uses the following database tables:

- `organizations`: Stores organization details
  - `id`: Primary key
  - `name`: Organization name
  - `industry`: Industry sector (optional)
  - `size`: Organization size (optional)
  - `address`: Physical address (optional)
  - `contact_email`: Primary contact email (optional)
  - `contact_phone`: Primary contact phone (optional)
  - `created_at`: Creation timestamp
  - `updated_at`: Last update timestamp

- `users`: Stores user information with organization relationships
  - `id`: Primary key
  - `name`: User's full name
  - `email`: User's email address (unique)
  - `password`: Hashed password
  - `role`: User role (admin, manager, auditor, user)
  - `organization_id`: Foreign key to organizations table
  - `is_active`: User status flag
  - `created_at`: Creation timestamp
  - `updated_at`: Last update timestamp

### API Endpoints

#### Organizations

- `GET /api/organizations`: Get all organizations
- `GET /api/organizations/:id`: Get organization by ID
- `POST /api/organizations`: Create a new organization
- `PUT /api/organizations/:id`: Update an organization
- `DELETE /api/organizations/:id`: Delete an organization

#### Organization Users

- `GET /api/organizations/:id/users`: Get users belonging to an organization
- `POST /api/organizations/:id/users`: Add a user to an organization
- `PUT /api/organizations/:id/users/:userId`: Update a user's role in an organization
- `DELETE /api/organizations/:id/users/:userId`: Remove a user from an organization

#### User Search

- `GET /api/users/search?query=<search_term>`: Search for users by name or email

### Frontend Components

#### Organization List

- Path: `/organizations`
- Component: `OrganizationListComponent`
- Features:
  - Display all organizations in a table
  - Create new organizations (admin only)
  - Edit or delete organizations (admin only)
  - View organization details

#### Organization Detail

- Path: `/organizations/:id`
- Component: `OrganizationDetailComponent`
- Features:
  - Display organization details
  - Edit organization information (admin only)
  - Delete organization (admin only)
  - View and manage organization users
  - Add users to organization (admin only)
  - Remove users from organization (admin only)
  - Change user roles within organization (admin only)

#### Organization Edit Dialog

- Component: `OrganizationEditDialogComponent`
- Features:
  - Create or edit organization details
  - Form validation for organization fields

#### User Add Dialog

- Component: `UserAddDialogComponent`
- Features:
  - Search for users to add to an organization
  - Select user role within the organization
  - Autocomplete user search functionality

### Role-Based Access Control

The organization management system implements role-based access control:

- **Admin**: Full access to all organization management features
  - Create, edit, delete organizations
  - Add, remove, update users in organizations
  - Change user roles

- **Manager**: Limited management capabilities
  - View organization details
  - View organization users
  - Limited user management within their organization

- **Auditor**: Read-only access
  - View organization details
  - View organization users

- **User**: Basic access
  - View organization details
  - View other users in their organization

### Development Guidelines

#### Adding New Organization Features

1. Update the database schema if necessary
2. Implement backend API endpoints in `app/controllers/organizationController.js`
3. Add routes in `app/routes/organizationRoutes.js`
4. Update the organization service in `client/src/app/services/organization.service.ts`
5. Create or modify Angular components in `client/src/app/organizations/`

#### User Management Integration

When implementing features that interact with both users and organizations:

1. Ensure proper permission checks in API endpoints
2. Use the AuthService to verify user roles on the frontend
3. Handle edge cases like users without organizations
4. Implement proper error handling for organization-related operations

## Testing

### API Testing

Test organization management API endpoints using tools like Postman or curl:

```bash
# Get all organizations
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/organizations

# Create an organization
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"name":"Test Org","industry":"Technology"}' http://localhost:5000/api/organizations
```

### Frontend Testing

Test organization management components using Angular testing tools:

```bash
# Run specific tests for organization components
cd client
ng test --include=**/organizations/**/*.spec.ts
```

## Common Issues and Solutions

### User Assignment Issues

**Problem**: Users cannot be assigned to organizations.

**Solution**: Check that:
1. The user is not already assigned to another organization
2. The current user has admin privileges
3. The organization ID is valid

### Role Management Issues

**Problem**: User roles are not being updated correctly.

**Solution**: Verify that:
1. The role value is one of: 'admin', 'manager', 'auditor', 'user'
2. The user making the request has admin privileges
3. The user being updated belongs to the specified organization

## Future Enhancements

Planned enhancements for the organization management system:

1. **Organization Hierarchy**: Support for parent-child relationships between organizations
2. **Department Management**: Add support for departments within organizations
3. **Custom Roles**: Allow defining custom roles with specific permissions
4. **Bulk User Management**: Tools for adding or updating multiple users at once
5. **Organization-Specific Settings**: Allow customizing settings at the organization level 