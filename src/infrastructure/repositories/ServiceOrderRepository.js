import { ServiceOrder, ServiceOrderStatus } from '../../domain/ServiceOrderAggregate/ServiceOrder.js';
import { Material } from '../../domain/ServiceOrderAggregate/Material.js';
import { IServiceOrderRepository } from '../../domain/ServiceOrderAggregate/interfaces/IServiceOrderRepository.js';
import { DbConnection } from '../db/DbConnection.js';

export class ServiceOrderRepository extends IServiceOrderRepository {
  constructor() {
    super();
    this.db = DbConnection.getInstance();
  }

  async save(serviceOrder) {
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        `INSERT INTO service_orders 
         (customer_name, company_name, appointment_date, status, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          serviceOrder.customerName,
          serviceOrder.companyName,
          serviceOrder.appointmentDate,
          serviceOrder.status,
          serviceOrder.createdAt,
          serviceOrder.updatedAt,
        ]
      );

      const savedOrder = orderResult.rows[0];
      const orderId = savedOrder.id;

      const savedItems = [];
      for (const material of serviceOrder.materials) {
        const materialResult = await client.query(
          `INSERT INTO materials 
           (service_order_id, description, product, internal_notes, ai_classification, is_hazardous) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
          [
            orderId,
            material.description,
            material.product,
            material.internalNotes,
            material.aiClassification,
            material.isHazardous,
          ]
        );

        savedItems.push(this.mapRowToMaterial(materialResult.rows[0]));
      }

      await client.query('COMMIT');

      return this.mapRowToServiceOrder(savedOrder, savedItems);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id) {
    const orderResult = await this.db.query('SELECT * FROM service_orders WHERE id = $1', [id]);

    if (orderResult.rows.length === 0) {
      return null;
    }

    const itemsResult = await this.db.query('SELECT * FROM materials WHERE service_order_id = $1', [id]);

    const items = itemsResult.rows.map((row) => this.mapRowToMaterial(row));

    return this.mapRowToServiceOrder(orderResult.rows[0], items);
  }

  async findAll(filters = {}) {
    let query = 'SELECT * FROM service_orders WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.customerEmail) {
      query += ` AND customer_email = $${paramCount}`;
      params.push(filters.customerEmail.toLowerCase());
      paramCount++;
    }

    if (filters.riskLevel) {
      query += ` AND total_risk = $${paramCount}`;
      params.push(filters.riskLevel);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.db.query(query, params);
    const orders = [];

    for (const orderRow of result.rows) {
      const itemsResult = await this.db.query(
        'SELECT * FROM materials WHERE service_order_id = $1',
        [orderRow.id]
      );
      const items = itemsResult.rows.map(row => this.mapRowToMaterial(row));
      orders.push(this.mapRowToServiceOrder(orderRow, items));
    }

    return orders;
  }

  async update(serviceOrder) {
    const result = await this.db.query(
      `UPDATE service_orders 
       SET customer_name = $1, customer_email = $2, customer_phone = $3, 
           address = $4, description = $5, status = $6, total_risk = $7, updated_at = $8
       WHERE id = $9 
       RETURNING *`,
      [
        serviceOrder.customerName,
        serviceOrder.customerEmail,
        serviceOrder.customerPhone,
        serviceOrder.address,
        serviceOrder.description,
        serviceOrder.status,
        serviceOrder.totalRisk,
        serviceOrder.updatedAt,
        parseInt(serviceOrder.id, 10),
      ]
    );

    const itemsResult = await this.db.query('SELECT * FROM waste_items WHERE service_order_id = $1', [parseInt(serviceOrder.id, 10)]);

    const items = itemsResult.rows.map((row) => this.mapRowToWasteItem(row));

    return this.mapRowToServiceOrder(result.rows[0], items);
  }

  async delete(id) {
    await this.db.query('DELETE FROM service_orders WHERE id = $1', [id]);
  }

  async updateMaterial(materialId, aiClassification, isHazardous, classificationCode = null, riskLevel = null) {
    const result = await this.db.query(
      `UPDATE materials 
       SET ai_classification = $1, is_hazardous = $2, classification_code = $3, 
           risk_level = $4, full_analysis = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING *`,
      [aiClassification, isHazardous, classificationCode, riskLevel, materialId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Material with id ${materialId} not found`);
    }

    return this.mapRowToMaterial(result.rows[0]);
  }

  // New methods for classification backfill
  async getUnclassifiedOrders(limit = 100000) {
    const result = await this.db.query(
      `SELECT * FROM service_orders 
       WHERE classification_result IS NULL 
       ORDER BY created_at ASC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  async updateClassification(serviceOrderId, classification, confidence, isBackfilled = false) {
    const result = await this.db.query(
      `UPDATE service_orders 
       SET classification_result = $1, classification_confidence = $2, 
            classification_timestamp = CURRENT_TIMESTAMP,
           is_backfilled = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 
       RETURNING *`,
      [classification, confidence, isBackfilled, serviceOrderId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Service order with id ${serviceOrderId} not found`);
    }

    return result.rows[0];
  }

  async getClassificationStats() {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(classification_result) as classified,
        COUNT(*) - COUNT(classification_result) as unclassified,
        COUNT(CASE WHEN is_backfilled = true THEN 1 END) as backfilled,
        COUNT(CASE WHEN classification_result = 'hazardous' THEN 1 END) as hazardous_count,
        COUNT(CASE WHEN classification_result = 'non-hazardous' THEN 1 END) as non_hazardous_count
      FROM service_orders
    `);

    const stats = result.rows[0];
    const classificationRate = stats.total > 0 ? ((stats.classified / stats.total) * 100).toFixed(2) + '%' : '0%';

    return {
      total: parseInt(stats.total),
      classified: parseInt(stats.classified),
      unclassified: parseInt(stats.unclassified),
      backfilled: parseInt(stats.backfilled),
      hazardousCount: parseInt(stats.hazardous_count),
      nonHazardousCount: parseInt(stats.non_hazardous_count),
      classificationRate
    };
  }

  async getClassifiedData(limit = 100, offset = 0, classification = null) {
    let query = `
      SELECT 
        so.id,
        so.customer_name,
        so.company_name,
        so.appointment_date,
        so.status,
        so.created_at,
        so.classification_result,
        so.classification_confidence,
        so.classification_timestamp,
        so.is_backfilled,
        CASE 
          WHEN so.classification_result = 'hazardous' THEN true
          ELSE false
        END as contains_hazardous_material,
        COUNT(m.id) as material_count,
        STRING_AGG(m.description, '; ') as material_descriptions
      FROM service_orders so
      LEFT JOIN materials m ON so.id = m.service_order_id
      WHERE so.classification_result IS NOT NULL
    `;

    const params = [];
    let paramCount = 1;

    if (classification) {
      query += ` AND so.classification_result = $${paramCount}`;
      params.push(classification);
      paramCount++;
    }

    query += ` GROUP BY so.id, so.customer_name, so.company_name, so.appointment_date, 
               so.status, so.created_at, so.classification_result, 
               so.classification_confidence,
               so.classification_timestamp, so.is_backfilled
               ORDER BY so.classification_timestamp DESC`;

    // Get total count
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(DISTINCT so.id) FROM');
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await this.db.query(query, params);

    return {
      data: result.rows,
      total
    };
  }

  mapRowToServiceOrder(row, materials) {
    return new ServiceOrder(
      row.id.toString(),
      row.customer_name,
      row.company_name,
      new Date(row.appointment_date),
      row.status,
      new Date(row.created_at),
      new Date(row.updated_at),
      materials
    );
  }

  mapRowToMaterial(row) {
    return new Material(
      row.id.toString(),
      row.description,
      row.product,
      row.internal_notes || '',
      row.ai_classification,
      row.is_hazardous,
      row.classification_code,
      row.risk_level,
      row.full_analysis
    );
  }
}

