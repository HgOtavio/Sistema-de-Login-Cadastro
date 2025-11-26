class User {
  constructor({ id, name, email, password, role, created_at, updated_at }) {
    this.id = id || null;
    this.name = name;
    this.email = email;
    this.password = password; 
    this.role = role || "user";
    this.created_at = created_at || new Date().toISOString();
    this.updated_at = updated_at || new Date().toISOString();
  }
}

module.exports = User;
