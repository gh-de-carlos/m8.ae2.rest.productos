import express from 'express';
import dotenv from 'dotenv';
import productosRoutes from './routes/productos.js';
import { getApiDocumentation } from './controllers/rootController.js';
import { 
  requestLogger, 
  notFoundHandler, 
  errorHandler 
} from './controllers/middlewareController.js';
import { startServer, setupServerShutdown } from './config/serverConfig.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para logging de requests
app.use(requestLogger);

// Endpoint raíz con documentación de la API
app.get('/', getApiDocumentation);

// Rutas de productos
app.use('/productos', productosRoutes);

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Middleware para manejo de errores
app.use(errorHandler);

// Inicializar y arrancar servidor
(async () => {
  const server = await startServer(app, PORT);
  
  // Configurar cierre del servidor
  setupServerShutdown(server);
})();