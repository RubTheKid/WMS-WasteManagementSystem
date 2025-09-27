import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'WMS - Waste Management System API',
            version: '1.0.0',
            description: 'API for managing waste collection service orders with AI-powered EPA compliance analysis',
            contact: {
                name: 'WMS Team',
                email: 'admin@wms.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token obtained from /api/auth/login endpoint'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Unique user identifier'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address'
                        },
                        name: {
                            type: 'string',
                            description: 'User full name'
                        },
                        role: {
                            type: 'string',
                            enum: ['ADMIN', 'EMPLOYEE'],
                            description: 'User role'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User last update timestamp'
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                            example: 'admin@wms.com'
                        },
                        password: {
                            type: 'string',
                            description: 'User password',
                            example: 'admin123'
                        }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Login successful'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                token: {
                                    type: 'string',
                                    description: 'JWT token for authentication'
                                },
                                user: {
                                    $ref: '#/components/schemas/User'
                                }
                            }
                        }
                    }
                },
                ServiceOrder: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Unique service order identifier'
                        },
                        customerName: {
                            type: 'string',
                            description: 'Customer name'
                        },
                        companyName: {
                            type: 'string',
                            description: 'Company name'
                        },
                        appointmentDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Scheduled appointment date and time'
                        },
                        status: {
                            type: 'string',
                            enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
                            description: 'Service order status'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Service order creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Service order last update timestamp'
                        },
                        materials: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Material'
                            }
                        }
                    }
                },
                Material: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Unique material identifier'
                        },
                        description: {
                            type: 'string',
                            description: 'Material description'
                        },
                        product: {
                            type: 'string',
                            description: 'Product type'
                        },
                        internalNotes: {
                            type: 'string',
                            description: 'Internal notes about the material'
                        },
                        aiClassification: {
                            type: 'string',
                            description: 'AI-generated classification'
                        },
                        isHazardous: {
                            type: 'boolean',
                            description: 'Whether the material is classified as hazardous'
                        },
                        classificationCode: {
                            type: 'string',
                            description: 'EPA classification code (D001-D043, F/K/P/U-listed)'
                        },
                        riskLevel: {
                            type: 'string',
                            enum: ['LOW', 'MODERATE', 'HIGH', 'EXTREME'],
                            description: 'Risk level assessment'
                        }
                        
                    }
                },
                CreateServiceOrderRequest: {
                    type: 'object',
                    required: ['customerName', 'companyName', 'appointmentDate', 'materials'],
                    properties: {
                        customerName: {
                            type: 'string',
                            description: 'Customer name',
                            example: 'John Doe'
                        },
                        companyName: {
                            type: 'string',
                            description: 'Company name',
                            example: 'Acme Corp'
                        },
                        appointmentDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Scheduled appointment date and time',
                            example: '2024-12-01T10:00:00Z'
                        },
                        materials: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/CreateMaterialRequest'
                            },
                            description: 'List of materials to collect'
                        }
                    }
                },
                CreateMaterialRequest: {
                    type: 'object',
                    required: ['description', 'product'],
                    properties: {
                        description: {
                            type: 'string',
                            description: 'Material description',
                            example: 'Old laptop batteries'
                        },
                        product: {
                            type: 'string',
                            enum: ['ELECTRONICS', 'CHEMICALS', 'BATTERIES', 'PAINT', 'METAL_SCRAP', 'PLASTIC', 'PAPER', 'GLASS', 'ORGANIC_WASTE', 'CONSTRUCTION_DEBRIS', 'OTHER'],
                            description: 'Product type',
                            example: 'BATTERIES'
                        }
                    }
                },
                ServiceOrdersResponse: {
                    type: 'object',
                    properties: {
                        serviceOrders: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/ServiceOrder'
                            }
                        },
                        total: {
                            type: 'integer',
                            description: 'Total number of service orders'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            description: 'Error message'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        './src/api/routes/*.js',
        './src/api/controllers/*.js'
    ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
