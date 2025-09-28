# WMS - Waste Management System

A comprehensive waste management system that uses AI and ML to classify hazardous materials and manage service orders.

## Prerequisites

- Docker and Docker Compose installed
- Ports 3000, 3001, 5432, and 5672 available on your system

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

### 3. Access the Application

- **Frontend:** http://localhost:3000 (when implemented)
- **API Documentation:** http://localhost:3001/swagger
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


### Key Features

- **ML Classification:** Rule-based algorithm with 90%+ accuracy
- **AI Fallback System:** Gemini AI for complex cases requiring higher confidence
- **Batch Processing:** Efficient processing of thousands of service orders
- **Real-time Processing:** Asynchronous material analysis via RabbitMQ
- **Rate Limiting:** Automatic API call management and throttling
- **Secure Authentication:** JWT-based authentication system
- **Modular Architecture:** Clean separation of concerns for maintainability

## API Endpoints

### Service Orders
- `POST /api/v1/service-orders` - Create new service order
- `GET /api/v1/service-orders` - List all service orders with filtering
- `GET /api/v1/service-orders/{id}` - Get specific service order
- `PUT /api/v1/service-orders/{id}` - Update service order

### Batch Processing
- `POST /api/v1/service-orders/batch/process` - Process multiple service orders efficiently
- `GET /api/v1/service-orders/batch/status/{requestId}` - Check batch processing status
- `GET /api/v1/service-orders/batch/metrics` - Get batch processing metrics and statistics

### Authentication
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/verify` - Verify JWT token

## Architecture

### Technology Stack
- **Frontend:** TBD (placeholder for future implementation)
- **Backend:** Node.js with Express
- **Database:** PostgreSQL
- **Message Queue:** RabbitMQ
- **AI Service:** Google Gemini API
- **ML Engine:** Custom rule-based classification algorithm
- **Authentication:** JWT
- **Documentation:** Swagger/OpenAPI
- **Architecture:** Clean Architecture with CQRS pattern

### System Components
- **API Layer:** RESTful endpoints with Swagger documentation
- **Application Layer:** Command/Query handlers following CQRS pattern
- **Domain Layer:** Business logic and entities
- **Infrastructure Layer:** Database, message queues, and external services

### Batch Processing Architecture
The system features a modular batch processing architecture designed for scalability and maintainability:

```
BatchProcessingService (Main Coordinator)
├── RateLimitManager (API call throttling)
├── BatchMetricsCollector (Performance tracking)
├── ServiceOrderProcessor (Individual order processing)
└── BatchOrchestrator (Workflow coordination)
```

**Key Benefits:**
- **Modular Design:** Each component has a single responsibility
- **Rate Limiting:** Automatic throttling to 100 API calls/second
- **Cost Optimization:** ML-first approach reduces AI API costs
- **Scalability:** Handles thousands of orders efficiently
- **Monitoring:** Real-time metrics and progress tracking

## Development

### Monorepo Structure
This project follows a monorepo structure with separate backend and frontend services:

- **Backend Service:** Complete Node.js/Express API with all business logic
- **Frontend Service:** Placeholder for future frontend implementation
- **Shared Infrastructure:** Database, message queues, and orchestration via Docker Compose

### Development Workflow

#### Backend Development
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test
```

#### Frontend Development
```bash
# Navigate to frontend directory (when implemented)
cd frontend

# Install dependencies and start development server
npm install && npm start
```

#### Full Stack Development
```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Project Structure
```
WasteManagementSystem/
├── backend/                 # Backend API service
│   ├── db/                 # Database initialization scripts
│   ├── src/                # Backend source code
│   │   ├── api/            # API controllers and routes
│   │   │   ├── controllers/ # Request handlers
│   │   │   ├── middleware/ # Authentication and validation
│   │   │   └── routes/     # API endpoint definitions
│   │   ├── application/    # Command/Query handlers (CQRS)
│   │   │   └── ServiceOrderAggregate/
│   │   │       ├── Commands/ # Command handlers
│   │   │       └── Queries/ # Query handlers
│   │   ├── domain/         # Business entities and logic
│   │   │   ├── ClassificationAggregate/
│   │   │   ├── ServiceOrderAggregate/
│   │   │   └── UserAggregate/
│   │   └── infrastructure/ # External integrations
│   │       ├── services/   # Business services
│   │       │   └── batch/  # Modular batch processing components
│   │       ├── repositories/ # Data access layer
│   │       ├── messageBroker/ # RabbitMQ integration
│   │       └── db/        # Database connection
│   ├── server.js          # Main server entry point
│   ├── Dockerfile         # Backend container configuration
│   └── package.json       # Backend dependencies
├── frontend/              # Frontend application (placeholder)
│   ├── src/              # Frontend source code
│   └── Dockerfile        # Frontend container configuration
├── docker-compose.yml    # Multi-service orchestration
└── readme.md            # Project documentation
```

### Database Schema
- **service_orders:** Main service order records
- **materials:** Individual material items with ML/AI classifications
- **users:** System users and authentication
- **batch_requests:** Batch processing status and metrics tracking

## Batch Processing Usage

### Processing Large Datasets
The system is optimized for processing large volumes of service orders efficiently:

```bash
# Example batch request
curl -X POST http://localhost:3001/api/v1/service-orders/batch/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceOrders": [
      {
        "customerName": "Company A",
        "companyName": "Corp A",
        "appointmentDate": "2024-12-01T10:00:00Z",
        "materials": [
          {
            "description": "Old laptop batteries",
            "product": "BATTERIES"
          }
        ]
      }
    ]
  }'
```

### Monitoring Progress
```bash
# Check processing status
curl -X GET http://localhost:3001/api/v1/service-orders/batch/status/{requestId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get processing metrics
curl -X GET http://localhost:3001/api/v1/service-orders/batch/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Performance Characteristics
- **Rate Limiting:** 100 API calls per second maximum
- **Batch Size:** 50 service orders per batch (configurable)
- **Concurrency:** 2 batches processed simultaneously
- **Cost Optimization:** ML-first approach reduces AI costs by 60-80%
- **Scalability:** Tested with 100,000+ service orders

### Backfill Scripts
The system includes scripts for efficiently processing large datasets:

```bash
# Process different batch sizes
npm run backfill:small    # 1,000 service orders
npm run backfill:medium   # 10,000 service orders  
npm run backfill:large    # 100,000 service orders
npm run backfill          # Custom size
```

These scripts automatically handle rate limiting, progress tracking, and error recovery.

## Troubleshooting

### Common Issues

**Port Conflicts:**
- Ensure ports 3000, 3001, 5432, and 5672 are available
- Check if other services are using these ports

**API Key Issues:**
- Verify your Gemini API key is valid and active
- Check that the key has proper permissions

**Database Connection:**
- Ensure PostgreSQL container is running
- Check database credentials in docker-compose.yml

### Development Guidelines
- Follow Clean Architecture principles
- Maintain single responsibility for each component
- Use TypeScript for type safety
- Write comprehensive tests for new features
- Update documentation for API changes

### Code Organization
- **Controllers:** Handle HTTP requests only
- **Handlers:** Contain business logic
- **Services:** Encapsulate domain operations
- **Repositories:** Manage data persistence
- **Domain:** Pure business logic without dependencies

### Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```
