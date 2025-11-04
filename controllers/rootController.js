// Controlador para el endpoint raíz con documentación de la API
export const getApiDocumentation = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.status(200).json({
    mensaje: 'Bienvenido a la API REST de Productos - M8 AE2',
    version: '1.0.0',
    autor: 'Carlos Pizarro Morales',
    descripcion: 'API RESTful para gestión de productos con PostgreSQL',
    endpoints: {
      productos: {
        'GET /productos': {
          descripcion: 'Obtiene todos los productos con paginación opcional',
          parametros: {
            limit: 'Número máximo de resultados (por defecto: 10)',
            offset: 'Número de resultados a omitir (por defecto: 0)',
            categoria: 'Filtrar por categoría específica (ropa, electronica, muebles, deportes, libros)'
          },
          ejemplo: `${baseUrl}/productos?limit=5&offset=0&categoria=electronica`
        },
        'GET /productos/:id': {
          descripcion: 'Obtiene un producto específico por su ID',
          ejemplo: `${baseUrl}/productos/1`
        },
        'POST /productos': {
          descripcion: 'Crea un nuevo producto',
          body: {
            nombre: 'string (requerido)',
            precio: 'number (requerido)',
            categoria: 'string (requerido) - Valores permitidos: ropa, electronica, muebles, deportes, libros',
            descripcion: 'string (opcional)'
          },
          ejemplo: `${baseUrl}/productos`
        },
        'PUT /productos/:id': {
          descripcion: 'Actualiza un producto existente',
          ejemplo: `${baseUrl}/productos/1`
        },
        'DELETE /productos/:id': {
          descripcion: 'Elimina un producto específico',
          ejemplo: `${baseUrl}/productos/1`
        },
        'DELETE /productos/purge': {
          descripcion: 'Elimina todos los productos (¡CUIDADO!)',
          ejemplo: `${baseUrl}/productos/purge`
        }
      }
    },
    categorias_permitidas: [
      'ropa',
      'electronica', 
      'muebles',
      'deportes',
      'libros'
    ],
    codigos_estado: {
      '200': 'OK - Solicitud exitosa',
      '201': 'Created - Recurso creado exitosamente',
      '400': 'Bad Request - Solicitud malformada',
      '404': 'Not Found - Recurso no encontrado',
      '500': 'Internal Server Error - Error del servidor'
    },
    links: [
      { rel: 'self', href: `${baseUrl}/` },
      { rel: 'productos', href: `${baseUrl}/productos` }
    ]
  });
};