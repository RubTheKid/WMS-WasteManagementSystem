import { CreateServiceOrderCommand, CreateMaterialCommand } from '../../application/ServiceOrderAggregate/Commands/CreateServiceOrder/CreateServiceOrderCommand.js';
import { GetAllServiceOrdersQuery } from '../../application/ServiceOrderAggregate/Queries/GetAllServiceOrders/GetAllServiceOrdersQuery.js';
import { ClassifyHazardousCommand } from '../../application/ServiceOrderAggregate/Commands/ClassifyHazardous/ClassifyHazardousCommand.js';
import { TriggerAnalysisCommand } from '../../application/ServiceOrderAggregate/Commands/TriggerAnalysis/TriggerAnalysisCommand.js';
import { UpdateServiceOrderCommand } from '../../application/ServiceOrderAggregate/Commands/UpdateServiceOrder/UpdateServiceOrderCommand.js';

export class ServiceOrderController {
  constructor(createServiceOrderHandler, getAllServiceOrdersHandler, triggerAnalysisHandler, classifyHazardousHandler, batchProcessingHandler, updateServiceOrderHandler) {
    this.createServiceOrderHandler = createServiceOrderHandler;
    this.getAllServiceOrdersHandler = getAllServiceOrdersHandler;
    this.triggerAnalysisHandler = triggerAnalysisHandler;
    this.classifyHazardousHandler = classifyHazardousHandler;
    this.batchProcessingHandler = batchProcessingHandler;
    this.updateServiceOrderHandler = updateServiceOrderHandler;
  }


  async getAllServiceOrders(req, res) {
    try {
      const filters = {};

      if (req.query.status) {
        filters.status = req.query.status;
      }
      if (req.query.customerEmail) {
        filters.customerEmail = req.query.customerEmail;
      }
      if (req.query.riskLevel) {
        filters.riskLevel = req.query.riskLevel;
      }

      const query = new GetAllServiceOrdersQuery(filters);
      const result = await this.getAllServiceOrdersHandler.handle(query);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error getting service orders:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createServiceOrder(req, res) {
    try {
      const { customerName, companyName, appointmentDate, materials } = req.body;

      const materialCommands = materials.map(m => 
        new CreateMaterialCommand(m.description, m.product)
      );

      const command = new CreateServiceOrderCommand(
        customerName,
        companyName,
        appointmentDate,
        materialCommands
      );

      const result = await this.createServiceOrderHandler.handle(command);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating service order:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async updateServiceOrder(req, res) {
    try {
      const { id } = req.params;
      const { customerName, companyName, appointmentDate, status, materials } = req.body;

      const command = new UpdateServiceOrderCommand(
        id,
        customerName,
        companyName,
        appointmentDate,
        status,
        materials
      );

      const result = await this.updateServiceOrderHandler.handle(command);

      if (result.success) {
        res.status(200).json(result.serviceOrder);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      console.error('Error updating service order:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async triggerAnalysis(req, res) {
    try {
      const command = new TriggerAnalysisCommand();
      const result = await this.triggerAnalysisHandler.handle(command);
      res.status(200).json(result.toJSON());
    } catch (error) {
      console.error('Error triggering analysis:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async classifyHazardous(req, res) {
    try {
      const { serviceOrderId } = req.params;
      
      if (!serviceOrderId) {
        return res.status(400).json({ error: 'Service order ID is required' });
      }

      const command = new ClassifyHazardousCommand(serviceOrderId);
      const result = await this.classifyHazardousHandler.handle(command);
      res.status(200).json(result.toJSON());
    } catch (error) {
      console.error('Error classifying service order:', error);
      
      if (error.message === 'Service order not found') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message });
    }
  }

  async processBatch(req, res) {
    try {
      const { serviceOrders } = req.body;

      if (!serviceOrders || !Array.isArray(serviceOrders)) {
        return res.status(400).json({
          error: 'Invalid request: serviceOrders array is required'
        });
      }

      if (serviceOrders.length === 0) {
        return res.status(400).json({
          error: 'Invalid request: serviceOrders array cannot be empty'
        });
      }

      if (serviceOrders.length > 50000) {
        return res.status(400).json({
          error: 'Invalid request: maximum 50,000 service orders per batch'
        });
      }
      const requestId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const result = await this.batchProcessingHandler.handle({
        serviceOrders,
        requestId,
        timestamp: new Date().toISOString()
      });

      res.status(202).json({
        requestId: result.requestId,
        status: 'ACCEPTED',
        message: 'Batch accepted for processing',
        totalServiceOrders: serviceOrders.length,
        estimatedProcessingTime: `${Math.ceil(serviceOrders.length / 10)} seconds`,
        statusUrl: `/api/v1/service-orders/batch/status/${result.requestId}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in BatchProcessingController:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' 
          ? 'Something went wrong!' 
          : error.message
      });
    }
  }

  async getProcessingStatus(req, res) {
    try {
      const { requestId } = req.params;

      if (!requestId) {
        return res.status(400).json({
          error: 'Invalid request: requestId is required'
        });
      }

      const status = await this.batchProcessingHandler.getStatus(requestId);

      if (!status) {
        return res.status(404).json({
          error: 'Processing request not found',
          message: `No batch processing request found with ID: ${requestId}`
        });
      }

      res.status(200).json(status);
    } catch (error) {
      console.error('Error getting processing status:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' 
          ? 'Something went wrong!' 
          : error.message
      });
    }
  }

  async getProcessingMetrics(req, res) {
    try {
      const metrics = await this.batchProcessingHandler.getMetrics();
      res.status(200).json(metrics);
    } catch (error) {
      console.error('Error getting processing metrics:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' 
          ? 'Something went wrong!' 
          : error.message
      });
    }
  }

}