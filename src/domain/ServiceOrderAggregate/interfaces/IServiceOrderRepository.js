export class IServiceOrderRepository {
  async save(serviceOrder) {
    throw new Error('Method must be implemented');
  }

  async findById(id) {
    throw new Error('Method must be implemented');
  }

  async findAll(filters = {}) {
    throw new Error('Method must be implemented');
  }

  async update(serviceOrder) {
    throw new Error('Method must be implemented');
  }
}