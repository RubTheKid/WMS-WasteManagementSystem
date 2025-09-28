import { Pool } from 'pg';
class DbConnection {
  static instance;
  pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'postgres',
      port: process.env.DB_PORT || '5432',
      database: process.env.DB_NAME || 'wms_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client:', err);
    });
  }

  static getInstance() {
    if (!DbConnection.instance) {
      DbConnection.instance = new DbConnection();
    }
    return DbConnection.instance;
  }

  async getClient() {
    return this.pool.connect();
  }

  async query(text, params) {
    try {
      const client = await this.getClient();
      try {
        return await client.query(text, params);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
}

export { DbConnection };