class User {
  constructor({ 
    id, 
    name, 
    email, 
    password, 
    role, 
    reset_token,
    reset_token_expire,
    created_at, 
    updated_at 
  }) {
    this.id = id || null;
    this.name = name;
    this.email = email;
    this.password = password; 
    this.role = role || "user";
    this.reset_token = reset_token || null;
    this.reset_token_expire = reset_token_expire || null;
    this.created_at = created_at || new Date().toISOString();
    this.updated_at = updated_at || new Date().toISOString();
  }
}

module.exports = User;
