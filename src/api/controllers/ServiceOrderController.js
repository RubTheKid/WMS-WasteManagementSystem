import { CreateServiceOrderCommand, CreateMaterialCommand } from '../../application/ServiceOrderAggregate/Commands/CreateServiceOrder/CreateServiceOrderCommand.js';
import { GetAllServiceOrdersQuery } from '../../application/ServiceOrderAggregate/Queries/GetAllServiceOrders/GetAllServiceOrdersQuery.js';

export class ServiceOrderController {
  constructor(createServiceOrderHandler, getAllServiceOrdersHandler, materialAnalysisScheduler) {
    this.createServiceOrderHandler = createServiceOrderHandler;
    this.getAllServiceOrdersHandler = getAllServiceOrdersHandler;
    this.materialAnalysisScheduler = materialAnalysisScheduler;
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

      console.log('Request body:', req.body);
      console.log('Materials:', materials);

      const materialCommands = materials.map(m => {
        console.log('Creating material command:', m);
        return new CreateMaterialCommand(m.description, m.product);
      });
      console.log('Material commands:', materialCommands);

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
      console.log('Manual analysis trigger requested');
      await this.materialAnalysisScheduler.triggerProcessing();
      res.status(200).json({
        message: 'Material analysis process triggered successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error triggering analysis:', error);
      res.status(500).json({ error: error.message });
    }
  }

}