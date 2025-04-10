/**
 * Global error handling middleware
 * Catches and formats errors for consistent API responses
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error(err.stack);
  
  // Default error status and message
  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  // Send error response
  res.status(status).json({
    error: true,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message
  });
};

module.exports = { errorHandler }; 