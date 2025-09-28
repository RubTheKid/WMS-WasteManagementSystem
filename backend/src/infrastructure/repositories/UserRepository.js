import { IUserRepository } from '../../domain/UserAggregate/interfaces/IUserRepository.js';
import { DbConnection } from '../db/DbConnection.js';
import { User } from '../../domain/UserAggregate/User.js';

export class UserRepository extends IUserRepository {
  constructor() {
    super();
    this.db = DbConnection.getInstance();
  }

  async findById(id) {
    const result = await this.db.query(
      "SELECT * FROM users WHERE id = $1", [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  async findByEmail(email) {
    const result = await this.db.query(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  mapRowToUser(row) {
    return new User(
      row.id,
      row.email,
      row.name,
      row.role,
      row.password_hash,
      row.created_at,
      row.updated_at
    );
  }
}