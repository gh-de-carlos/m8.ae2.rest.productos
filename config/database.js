import pg from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const { Pool } = pg;

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Probar la conexión al inicializar
pool.on('connect', () => {
  console.log('[OK]   Conectado exitosamente a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[ERROR] Error inesperado en la conexión a la base de datos:', err);
  process.exit(-1);
});

// Función para inicializar la tabla de productos si no existe
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Crear tabla productos si no existe
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        descripcion TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createTableQuery);
    console.log('[OK]   Tabla "productos" verificada/creada exitosamente');
    
    // Insertar datos de prueba si la tabla está vacía
    const countResult = await client.query('SELECT COUNT(*) FROM productos');
    const count = parseInt(countResult.rows[0].count);
    
    if (count === 0) {
      const insertSampleData = `
        INSERT INTO productos (nombre, precio, categoria, descripcion) VALUES
        ('Camiseta Básica', 12000, 'ropa', 'Camiseta de algodón 100% en varios colores'),
        ('Pantalón Mezclilla', 25000, 'ropa', 'Pantalón de mezclilla azul clásico'),
        ('Smartphone Galaxy', 450000, 'electronica', 'Teléfono inteligente con pantalla de 6.5 pulgadas'),
        ('Laptop Gamer', 1200000, 'electronica', 'Laptop para gaming con tarjeta gráfica dedicada'),
        ('Mesa de Madera', 85000, 'muebles', 'Mesa de comedor para 4 personas'),
        ('Silla Ergonómica', 95000, 'muebles', 'Silla de oficina con soporte lumbar'),
        ('Balón de Fútbol', 18000, 'deportes', 'Balón oficial tamaño 5'),
        ('Raqueta de Tenis', 75000, 'deportes', 'Raqueta profesional de tenis'),
        ('Libro de Cocina', 28000, 'libros', 'Recetas tradicionales mexicanas'),
        ('Novela Clásica', 15000, 'libros', 'Edición especial de literatura universal');
      `;
      
      await client.query(insertSampleData);
      console.log('[OK] Datos de prueba insertados exitosamente');
    }
    
    client.release();
  } catch (err) {
    console.error('[ERROR] Error al inicializar la base de datos:', err);
    throw err;
  }
};

export { pool, initializeDatabase };