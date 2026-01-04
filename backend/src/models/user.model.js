/**
 * User Model
 * Represents a user in the system
 */

export class User {
  constructor(data) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.password = data.password || ''; // Will be hashed
    this.name = data.name || '';
    this.role = data.role || 'user'; // user, admin
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.lastLogin = data.lastLogin || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.sessions = data.sessions || []; // Array of session IDs
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      password: this.password, // Include password for database storage
      name: this.name,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLogin: this.lastLogin,
      isActive: this.isActive,
      sessions: this.sessions
    };
  }

  // Exclude password from JSON
  toPublicJSON() {
    const json = this.toJSON();
    delete json.password;
    return json;
  }
}

