import { DbConnection } from '../db/DbConnection.js';

export class BatchRequestRepository {
  constructor() {
    this.db = DbConnection.getInstance();
  }

  async create(requestId, totalServiceOrders) {
    const result = await this.db.query(
      `INSERT INTO batch_requests (request_id, total_service_orders, status) 
       VALUES ($1, $2, 'PENDING') 
       RETURNING *`,
      [requestId, totalServiceOrders]
    );

    return result.rows[0];
  }

  async findByRequestId(requestId) {
    const result = await this.db.query(
      'SELECT * FROM batch_requests WHERE request_id = $1',
      [requestId]
    );

    return result.rows[0] || null;
  }

  async updateStatus(requestId, status, additionalFields = {}) {
    const fields = ['status = $2'];
    const values = [requestId, status];
    let paramIndex = 3;

    Object.entries(additionalFields).forEach(([key, value]) => {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });

    const query = `
      UPDATE batch_requests 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE request_id = $1 
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Batch request with ID ${requestId} not found`);
    }

    return result.rows[0];
  }

  async updateProgress(requestId, progress) {
    const result = await this.db.query(
      `UPDATE batch_requests 
       SET processed_count = $2, successful_count = $3, failed_count = $4, updated_at = CURRENT_TIMESTAMP
       WHERE request_id = $1 
       RETURNING *`,
      [requestId, progress.processed_count, progress.successful_count, progress.failed_count]
    );

    if (result.rows.length === 0) {
      throw new Error(`Batch request with ID ${requestId} not found`);
    }

    return result.rows[0];
  }

  async getStatus(requestId) {
    const batchRequest = await this.findByRequestId(requestId);
    
    if (!batchRequest) {
      return null;
    }

    const progress = {
      total: batchRequest.total_service_orders,
      processed: batchRequest.processed_count,
      successful: batchRequest.successful_count,
      failed: batchRequest.failed_count,
      percentage: Math.round((batchRequest.processed_count / batchRequest.total_service_orders) * 100)
    };

    let estimatedTimeRemaining = null;
    if (batchRequest.status === 'IN_PROGRESS' && batchRequest.started_at && batchRequest.processed_count > 0) {
      const elapsedTime = Date.now() - new Date(batchRequest.started_at).getTime();
      const avgTimePerItem = elapsedTime / batchRequest.processed_count;
      const remainingItems = batchRequest.total_service_orders - batchRequest.processed_count;
      estimatedTimeRemaining = Math.round((avgTimePerItem * remainingItems) / 1000);
    }

    return {
      requestId: batchRequest.request_id,
      status: batchRequest.status,
      progress,
      estimatedTimeRemaining,
      errorMessage: batchRequest.error_message,
      createdAt: batchRequest.created_at,
      startedAt: batchRequest.started_at,
      completedAt: batchRequest.completed_at,
      updatedAt: batchRequest.updated_at
    };
  }

  async getActiveRequests() {
    const result = await this.db.query(
      `SELECT * FROM batch_requests 
       WHERE status IN ('PENDING', 'IN_PROGRESS') 
       ORDER BY created_at ASC`
    );

    return result.rows;
  }

  async getMetrics() {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress_requests,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_requests,
        SUM(total_service_orders) as total_service_orders_processed,
        SUM(successful_count) as total_successful,
        SUM(failed_count) as total_failed,
        AVG(CASE 
          WHEN completed_at IS NOT NULL AND started_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000 
        END) as avg_processing_time_ms
      FROM batch_requests
    `);

    return result.rows[0];
  }

  async cleanup(olderThanDays = 30) {
    const result = await this.db.query(
      `DELETE FROM batch_requests 
       WHERE status IN ('COMPLETED', 'FAILED') 
       AND completed_at < NOW() - INTERVAL '${olderThanDays} days'
       RETURNING request_id`,
    );

    return result.rows.length;
  }
}