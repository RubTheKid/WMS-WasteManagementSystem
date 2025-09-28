# WMS - Waste Management System

A comprehensive waste management system that uses AI to classify hazardous materials and manage service orders.

## Prerequisites

- Docker and Docker Compose installed
- Ports 3001, 5432, and 5672 available on your system

## Quick Start

### 1. Environment Setup

Create a `.env` file in the project root:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
JWT_SECRET=your-super-secret-key-here
```

**Get your Gemini API key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 2. Start the Application

```bash
docker-compose up -d
```

### 3. Access the API

- **API Documentation:** http://localhost:3001/api-docs
- **API Base URL:** http://localhost:3001

## Authentication

### Default Login Credentials

```json
{
  "email": "admin@wms.com",
  "password": "admin123"
}
```

### Using the API

1. Login via `POST /api/v1/auth/login`
2. Copy the JWT token from the response
3. Click "Authorize" in Swagger and paste the token
4. Verify your token with `GET /api/v1/auth/verify`

## System Overview

### Service Orders

The system processes waste material requests through the following workflow:

1. **Client Submission:** Clients submit service orders with material descriptions
2. **AI Analysis:** Materials are automatically analyzed using Gemini AI to classify:
   - Hazardous vs non-hazardous
   - Risk levels (Low, Moderate, High, Critical)
   - Classification codes (D001-D043, F-listed, K-listed, etc.)
3. **Employee Review:** Staff review AI classifications and add notes
4. **Appointment Confirmation:** Final approval and scheduling

### Key Features

- **AI-Powered Classification:** Automatic hazardous material detection
- **Fallback System:** Rule-based ML algorithm when AI is unavailable
- **Real-time Processing:** Asynchronous material analysis via message queues
- **Comprehensive API:** Full CRUD operations for service orders and materials
- **Secure Authentication:** JWT-based authentication system

## API Endpoints

### Service Orders
- `POST /api/v1/service-orders` - Create new service order
- `GET /api/v1/service-orders` - List all service orders with filtering
- `GET /api/v1/service-orders/{id}` - Get specific service order
- `PUT /api/v1/service-orders/{id}` - Update service order
- `POST /api/v1/service-orders/{id}/classify-hazardous` - Trigger material analysis

### Authentication
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/verify` - Verify JWT token

## Architecture

### Technology Stack
- **Backend:** Node.js with Express
- **Database:** PostgreSQL
- **Message Queue:** RabbitMQ
- **AI Service:** Google Gemini API
- **Authentication:** JWT
- **Documentation:** Swagger/OpenAPI

### System Components
- **API Layer:** RESTful endpoints with Swagger documentation
- **Application Layer:** Command/Query handlers following CQRS pattern
- **Domain Layer:** Business logic and entities
- **Infrastructure Layer:** Database, message queues, and external services

## Development

### Project Structure
```
src/
├── api/                 # API controllers and routes
├── application/         # Command/Query handlers
├── domain/             # Business entities and logic
└── infrastructure/     # Database, services, and external integrations
```

### Database Schema
- **service_orders:** Main service order records
- **materials:** Individual material items with AI classifications
- **users:** System users and authentication

## Troubleshooting

### Common Issues

**Port Conflicts:**
- Ensure ports 3001, 5432, and 5672 are available
- Check if other services are using these ports

**API Key Issues:**
- Verify your Gemini API key is valid and active
- Check that the key has proper permissions

**Database Connection:**
- Ensure PostgreSQL container is running
- Check database credentials in docker-compose.yml

### Logs
View application logs:
```bash
docker-compose logs backend
```
