// Middleware para logging de requests
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
};

// Middleware para rutas no encontradas (404)
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    mensaje: `La ruta ${req.method} ${req.url} no existe en esta API`,
    sugerencia: 'Visita la raíz (/) para ver los endpoints disponibles',
    links: [
      { rel: 'home', href: `${req.protocol}://${req.get('host')}/` }
    ]
  });
};

// Middleware para manejo de errores del servidor (500)
export const errorHandler = (error, req, res, next) => {
  console.error('[ERROR] Error en el servidor:', error);
  
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
    timestamp: new Date().toISOString(),
    links: [
      { rel: 'home', href: `${req.protocol}://${req.get('host')}/` }
    ]
  });
};