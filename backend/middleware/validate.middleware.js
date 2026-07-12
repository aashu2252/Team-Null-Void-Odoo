const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errorDetails = result.error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorDetails
    });
  }
  // Assign validated and cleaned data to request body
  req.body = result.data;
  next();
};

module.exports = validate;
