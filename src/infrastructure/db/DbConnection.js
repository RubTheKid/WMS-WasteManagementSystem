import { Pool } from 'pg';
class DbConnection {
  static instance;
  pool;

  constructor() {
    this.pool = new Pool({
      host: 'localhost',
      port: '5432',
      database: 'wms_db',
      user: 'postgres',
      password: 'postgres',
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
    const client = await this.getClient();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}

export { DbConnection };