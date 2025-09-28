export class User {
  constructor(id, email, name, role, passwordHash, createdAt, updatedAt) {
    this.validateEmail(email);
    this.validateName(name);
    this.validateRole(role);

    this.id = id;
    this.email = email.toLowerCase();
    this.name = name;
    this.role = role;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  validateEmail(email) {
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email format');
    }
  }

  validateName(name) {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
  }

  validateRole(role) {
    if (!Object.values(UserRole).includes(role)) {
      throw new Error('Invalid user role');
    }
  }

  isAdmin() {
    return this.role === UserRole.ADMIN;
  }

  isEmployee() {
    return this.role === UserRole.EMPLOYEE;
  }

  update(data) {
    const updatedUser = new User(
      this.id,
      data.email || this.email,
      data.name || this.name,
      data.role || this.role,
      data.passwordHash || this.passwordHash,
      this.createdAt,
      new Date()
    );
    return updatedUser;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toSafeJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export const UserRole = {
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE",
};