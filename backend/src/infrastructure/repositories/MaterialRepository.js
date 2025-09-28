import { DbConnection } from '../db/DbConnection.js';

export class MaterialRepository {
    constructor() {
        this.db = DbConnection.getInstance();
    }

    async getByServiceOrderId(serviceOrderId) {
        const result = await this.db.query(
            'SELECT * FROM materials WHERE service_order_id = $1',
            [serviceOrderId]
        );
        return result.rows;
    }

    async updateClassification(materialId, classification, confidence) {
        const result = await this.db.query(
            `UPDATE materials 
             SET classification_result = $1, classification_confidence = $2, 
             classification_timestamp = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 
             RETURNING *`,
            [classification, confidence, materialId]
        );

        if (result.rows.length === 0) {
            throw new Error(`Material with id ${materialId} not found`);
        }

        return result.rows[0];
    }

    async getClassificationStats() {
        const result = await this.db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(classification_result) as classified,
                COUNT(*) - COUNT(classification_result) as unclassified,
                COUNT(CASE WHEN classification_result = 'hazardous' THEN 1 END) as hazardous_count,
                COUNT(CASE WHEN classification_result = 'non-hazardous' THEN 1 END) as non_hazardous_count
            FROM materials
        `);

        const stats = result.rows[0];
        const classificationRate = stats.total > 0 ? ((stats.classified / stats.total) * 100).toFixed(2) + '%' : '0%';

        return {
            total: parseInt(stats.total),
            classified: parseInt(stats.classified),
            unclassified: parseInt(stats.unclassified),
            hazardousCount: parseInt(stats.hazardous_count),
            nonHazardousCount: parseInt(stats.non_hazardous_count),
            classificationRate
        };
    }
}
