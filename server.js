import express from 'express';
import dotenv from 'dotenv';
import productosRoutes from './routes/productos.js';
import { getApiDocumentation } from './controllers/rootController.js';
import { startServer, setupServerShutdown } from './config/serverConfig.js';
import { 
  requestLogger, 
  notFoundHandler, 
  errorHandler 
} from './controllers/middlewareController.js';


dotenv.config();                                // Cargar variables de entorno
const app = express();                          // Crear instancia de Express
const PORT = process.env.PORT || 3000;          // Puerto del servidor


app.use(express.json());                        // Middleware para parsear JSON
app.use(requestLogger);                         // Middleware para logging de requests
app.get('/', getApiDocumentation);              // Endpoint raíz con documentación de la API
app.use('/productos', productosRoutes);         // Rutas de productos
app.use(notFoundHandler);                       // Middleware para rutas no encontradas
app.use(errorHandler);                          // Middleware para manejo de errores


(async () => {                                  // Inicializar y arrancar servidor
  const server = await startServer(app, PORT);
  
  // Configurar cierre del servidor
  setupServerShutdown(server);
})();