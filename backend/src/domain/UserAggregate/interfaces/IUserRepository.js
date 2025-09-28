export class IUserRepository {
  async findById(id) {
    throw new Error('Method must be implemented');
  }

  async findByEmail(email) {
    throw new Error('Method must be implemented');
  }
}