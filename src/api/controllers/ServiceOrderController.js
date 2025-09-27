import { CreateServiceOrderCommand, CreateMaterialCommand } from '../../application/ServiceOrderAggregate/Commands/CreateServiceOrder/CreateServiceOrderCommand.js';
import { GetAllServiceOrdersQuery } from '../../application/ServiceOrderAggregate/Queries/GetAllServiceOrders/GetAllServiceOrdersQuery.js';
import { ClassifyHazardousCommand } from '../../application/ServiceOrderAggregate/Commands/ClassifyHazardous/ClassifyHazardousCommand.js';
import { TriggerAnalysisCommand } from '../../application/ServiceOrderAggregate/Commands/TriggerAnalysis/TriggerAnalysisCommand.js';

export class ServiceOrderController {
  constructor(createServiceOrderHandler, getAllServiceOrdersHandler, triggerAnalysisHandler, classifyHazardousHandler) {
    this.createServiceOrderHandler = createServiceOrderHandler;
    this.getAllServiceOrdersHandler = getAllServiceOrdersHandler;
    this.triggerAnalysisHandler = triggerAnalysisHandler;
    this.classifyHazardousHandler = classifyHazardousHandler;
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

}