module.exports = {
  get mongoUrl() {
    return process.env.MONGODB_URI || "";
  },
  get Jwt_secret() {
    return process.env.JWT_SECRET || "starknet_fallback_jwt_secret_key_9988";
  }
};
