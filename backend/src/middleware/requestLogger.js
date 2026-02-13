export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Skip logging for health check
  if (req.path === '/api/health') {
    return next();
  }

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous',
      userRole: req.user?.role || 'anonymous'
    };

    // Color coding for logs
    const statusCode = res.statusCode;
    const statusColor = statusCode < 400 ? '✅' : statusCode < 500 ? '⚠️' : '❌';

    if (process.env.NODE_ENV === 'development') {
      console.log(`${statusColor} [${log.method}] ${log.path} - ${log.status} (${log.duration})`);
    }
  });

  next();
};
