import { initializeDatabase } from './database.js';

// Función para inicializar base de datos y arrancar servidor
export const startServer = async (app, PORT) => {
  try {
    console.log('[INFO] Inicializando base de datos...');
    await initializeDatabase();
    
    const server = app.listen(PORT, () => {
      console.log(`[OK]   Servidor corriendo en http://localhost:${PORT}`);
      console.log(`[INFO] Documentación disponible en http://localhost:${PORT}/`);
      console.log('[INFO] Endpoints de productos disponibles en /productos');
      console.log('[INFO] Presiona Ctrl+C para detener el servidor');
    });

    return server;
  } catch (error) {
    console.error('[ERROR] Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Configuración del manejo del cierre del servidor
export const setupServerShutdown = (server = null) => {
  const shutdown = (signal) => {
    console.log(`\n[STOP] Recibida señal ${signal}. Cerrando servidor...`);
    
    if (server) {
      server.close((err) => {
        if (err) {
          console.error('[ERROR] Error al cerrar el servidor:', err);
          process.exit(1);
        }
        console.log('[INFO] Servidor cerrado correctamente');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};