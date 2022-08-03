class ValidationError extends Error {
  constructor(message) {
    super(`Validation error: ${message}`);
  }
}

module.exports = { ValidationError };
