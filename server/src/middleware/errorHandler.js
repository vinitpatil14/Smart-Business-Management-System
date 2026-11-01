const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  // Prisma Unique Constraint Error
  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target || 'field';
    return res.status(400).json({
      success: false,
      message: `A record with this ${target} already exists.`
    });
  }

  // Prisma Record Not Found Error
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: err.meta?.cause || 'Requested record was not found.'
    });
  }

  // Prisma Foreign Key Constraint Error
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete this record because it is referenced by existing transactions (sales invoices, purchases, or line items).'
    });
  }

  // Custom validation or business error
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'An unexpected error occurred'
  });
};

module.exports = errorHandler;
