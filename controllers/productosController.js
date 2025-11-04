import { pool } from '../config/database.js';

// Categorías permitidas para productos
const CATEGORIAS_PERMITIDAS = ['ropa', 'electronica', 'muebles', 'deportes', 'libros'];

// Función auxiliar para validar categoría
const validarCategoria = (categoria) => {
  if (!categoria || typeof categoria !== 'string') {
    return false;
  }
  return CATEGORIAS_PERMITIDAS.includes(categoria.trim().toLowerCase());
};

// Función auxiliar para generar links HATEOAS
const generateLinks = (req, id = null, pagination = null) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const links = [
    { rel: 'self', href: `${baseUrl}${req.originalUrl}` },
    { rel: 'home', href: `${baseUrl}/` },
    { rel: 'collection', href: `${baseUrl}/productos` }
  ];

  if (id) {
    links.push({ rel: 'item', href: `${baseUrl}/productos/${id}` });
  }

  if (pagination) {
    const { limit, offset, total } = pagination;
    const query = req.query;
    
    if (offset > 0) {
      const prevOffset = Math.max(0, offset - limit);
      const prevQuery = new URLSearchParams({ ...query, limit, offset: prevOffset });
      links.push({ rel: 'prev', href: `${baseUrl}/productos?${prevQuery}` });
    }
    
    if (offset + limit < total) {
      const nextOffset = offset + limit;
      const nextQuery = new URLSearchParams({ ...query, limit, offset: nextOffset });
      links.push({ rel: 'next', href: `${baseUrl}/productos?${nextQuery}` });
    }
  }

  return links;
};

// Función auxiliar para generar metadatos
const generateMeta = (total, limit, offset, filtros = {}) => {
  return {
    total: parseInt(total),
    limit: parseInt(limit),
    offset: parseInt(offset),
    filtros: filtros
  };
};

// Obtener todos los productos con paginación y filtros
export const obtenerProductos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const categoria = req.query.categoria;

    // Validar parámetros
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Parámetro inválido',
        mensaje: 'El límite debe estar entre 1 y 100',
        links: generateLinks(req)
      });
    }

    if (offset < 0) {
      return res.status(400).json({
        error: 'Parámetro inválido',
        mensaje: 'El offset no puede ser negativo',
        links: generateLinks(req)
      });
    }

    // Validar categoría si se proporciona como filtro
    if (categoria && !validarCategoria(categoria)) {
      return res.status(400).json({
        error: 'Categoría inválida para filtro',
        mensaje: 'La categoría de filtro debe ser una de las siguientes opciones',
        categorias_permitidas: CATEGORIAS_PERMITIDAS,
        categoria_recibida: categoria,
        links: generateLinks(req)
      });
    }

    let query = 'SELECT * FROM productos';
    let countQuery = 'SELECT COUNT(*) FROM productos';
    let params = [];
    let countParams = [];

    // Aplicar filtro por categoría si se proporciona
    if (categoria) {
      query += ' WHERE categoria = $1';
      countQuery += ' WHERE categoria = $1';
      params.push(categoria);
      countParams.push(categoria);
    }

    // Obtener total de registros
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Aplicar paginación
    query += ` ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const filtros = categoria ? { categoria } : {};
    
    res.status(200).json({
      data: result.rows,
      links: generateLinks(req, null, { limit, offset, total }),
      meta: generateMeta(total, limit, offset, filtros)
    });

  } catch (error) {
    console.error('[ERROR] Error al obtener productos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudieron obtener los productos',
      links: generateLinks(req)
    });
  }
};

// Obtener un producto por ID
export const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'ID inválido',
        mensaje: 'El ID debe ser un número válido',
        links: generateLinks(req)
      });
    }

    const query = 'SELECT * FROM productos WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        mensaje: `No existe un producto con ID ${id}`,
        links: generateLinks(req)
      });
    }

    const producto = result.rows[0];

    res.status(200).json({
      data: producto,
      links: generateLinks(req, id),
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[ERROR] Error al obtener producto por ID:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo obtener el producto',
      links: generateLinks(req)
    });
  }
};

// Crear un nuevo producto
export const crearProducto = async (req, res) => {
  try {
    const { nombre, precio, categoria, descripcion } = req.body;

    // Validar campos requeridos
    if (!nombre || !precio || !categoria) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'Los campos nombre, precio y categoría son obligatorios',
        campos_requeridos: ['nombre', 'precio', 'categoria'],
        links: generateLinks(req)
      });
    }

    // Validar tipos de datos
    if (typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: 'El nombre debe ser una cadena de texto no vacía',
        links: generateLinks(req)
      });
    }

    if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: 'El precio debe ser un número mayor a 0',
        links: generateLinks(req)
      });
    }

    if (typeof categoria !== 'string' || categoria.trim().length === 0) {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: 'La categoría debe ser una cadena de texto no vacía',
        links: generateLinks(req)
      });
    }

    // Validar que la categoría esté en la lista permitida
    if (!validarCategoria(categoria)) {
      return res.status(400).json({
        error: 'Categoría inválida',
        mensaje: 'La categoría debe ser una de las siguientes opciones',
        categorias_permitidas: CATEGORIAS_PERMITIDAS,
        categoria_recibida: categoria.trim().toLowerCase(),
        links: generateLinks(req)
      });
    }

    const query = `
      INSERT INTO productos (nombre, precio, categoria, descripcion, fecha_actualizacion)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const values = [
      nombre.trim(),
      parseFloat(precio),
      categoria.trim().toLowerCase(),
      descripcion?.trim() || null
    ];

    const result = await pool.query(query, values);
    const nuevoProducto = result.rows[0];

    res.status(201).json({
      data: nuevoProducto,
      mensaje: 'Producto creado exitosamente',
      links: generateLinks(req, nuevoProducto.id),
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[ERROR] Error al crear producto:', error);
    
    // Manejar errores específicos de PostgreSQL
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'Producto duplicado',
        mensaje: 'Ya existe un producto con esos datos',
        links: generateLinks(req)
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo crear el producto',
      links: generateLinks(req)
    });
  }
};

// Actualizar un producto existente
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, categoria, descripcion } = req.body;

    // Validar que el ID sea un número
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'ID inválido',
        mensaje: 'El ID debe ser un número válido',
        links: generateLinks(req)
      });
    }

    // Verificar que el producto existe
    const existeQuery = 'SELECT * FROM productos WHERE id = $1';
    const existeResult = await pool.query(existeQuery, [id]);

    if (existeResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        mensaje: `No existe un producto con ID ${id}`,
        links: generateLinks(req)
      });
    }

    // Validar que se proporcionó al menos un campo para actualizar
    if (!nombre && !precio && !categoria && descripcion === undefined) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'Debe proporcionar al menos un campo para actualizar',
        campos_opcionales: ['nombre', 'precio', 'categoria', 'descripcion'],
        links: generateLinks(req)
      });
    }

    const productoActual = existeResult.rows[0];
    const camposActualizar = [];
    const valores = [];
    let contador = 1;

    // Construir query dinámicamente con solo los campos proporcionados
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim().length === 0) {
        return res.status(400).json({
          error: 'Datos inválidos',
          mensaje: 'El nombre debe ser una cadena de texto no vacía',
          links: generateLinks(req)
        });
      }
      camposActualizar.push(`nombre = $${contador}`);
      valores.push(nombre.trim());
      contador++;
    }

    if (precio !== undefined) {
      if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
        return res.status(400).json({
          error: 'Datos inválidos',
          mensaje: 'El precio debe ser un número mayor a 0',
          links: generateLinks(req)
        });
      }
      camposActualizar.push(`precio = $${contador}`);
      valores.push(parseFloat(precio));
      contador++;
    }

    if (categoria !== undefined) {
      if (typeof categoria !== 'string' || categoria.trim().length === 0) {
        return res.status(400).json({
          error: 'Datos inválidos',
          mensaje: 'La categoría debe ser una cadena de texto no vacía',
          links: generateLinks(req)
        });
      }
      
      // Validar que la categoría esté en la lista permitida
      if (!validarCategoria(categoria)) {
        return res.status(400).json({
          error: 'Categoría inválida',
          mensaje: 'La categoría debe ser una de las siguientes opciones',
          categorias_permitidas: CATEGORIAS_PERMITIDAS,
          categoria_recibida: categoria.trim().toLowerCase(),
          links: generateLinks(req)
        });
      }
      
      camposActualizar.push(`categoria = $${contador}`);
      valores.push(categoria.trim().toLowerCase());
      contador++;
    }

    if (descripcion !== undefined) {
      camposActualizar.push(`descripcion = $${contador}`);
      valores.push(descripcion?.trim() || null);
      contador++;
    }

    // Siempre actualizar fecha_actualizacion
    camposActualizar.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);

    const updateQuery = `
      UPDATE productos 
      SET ${camposActualizar.join(', ')}
      WHERE id = $${contador}
      RETURNING *
    `;
    
    valores.push(id);

    const result = await pool.query(updateQuery, valores);
    const productoActualizado = result.rows[0];

    res.status(200).json({
      data: productoActualizado,
      mensaje: 'Producto actualizado exitosamente',
      links: generateLinks(req, id),
      meta: {
        timestamp: new Date().toISOString(),
        campos_actualizados: Object.keys(req.body).filter(key => req.body[key] !== undefined)
      }
    });

  } catch (error) {
    console.error('[ERROR] Error al actualizar producto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo actualizar el producto',
      links: generateLinks(req)
    });
  }
};

// Eliminar un producto por ID
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'ID inválido',
        mensaje: 'El ID debe ser un número válido',
        links: generateLinks(req)
      });
    }

    // Verificar que el producto existe antes de eliminarlo
    const existeQuery = 'SELECT * FROM productos WHERE id = $1';
    const existeResult = await pool.query(existeQuery, [id]);

    if (existeResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        mensaje: `No existe un producto con ID ${id}`,
        links: generateLinks(req)
      });
    }

    const productoEliminado = existeResult.rows[0];

    const deleteQuery = 'DELETE FROM productos WHERE id = $1';
    await pool.query(deleteQuery, [id]);

    res.status(200).json({
      data: productoEliminado,
      mensaje: `Producto con ID ${id} eliminado exitosamente`,
      links: [
        { rel: 'collection', href: `${req.protocol}://${req.get('host')}/productos` },
        { rel: 'home', href: `${req.protocol}://${req.get('host')}/` }
      ],
      meta: {
        timestamp: new Date().toISOString(),
        accion: 'eliminacion'
      }
    });

  } catch (error) {
    console.error('[ERROR] Error al eliminar producto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo eliminar el producto',
      links: generateLinks(req)
    });
  }
};

// Eliminar todos los productos (purge)
export const purgarProductos = async (req, res) => {
  try {
    // Obtener count antes de eliminar
    const countQuery = 'SELECT COUNT(*) FROM productos';
    const countResult = await pool.query(countQuery);
    const totalEliminados = parseInt(countResult.rows[0].count);

    if (totalEliminados === 0) {
      return res.status(200).json({
        data: null,
        mensaje: 'No hay productos para eliminar',
        links: generateLinks(req),
        meta: {
          timestamp: new Date().toISOString(),
          productos_eliminados: 0
        }
      });
    }

    // Eliminar todos los productos
    const deleteQuery = 'DELETE FROM productos';
    await pool.query(deleteQuery);

    // Reset del sequence para que los IDs empiecen desde 1 nuevamente
    const resetSequenceQuery = 'ALTER SEQUENCE productos_id_seq RESTART WITH 1';
    await pool.query(resetSequenceQuery);

    res.status(200).json({
      data: null,
      mensaje: `Todos los productos han sido eliminados exitosamente (${totalEliminados} productos)`,
      advertencia: 'Esta acción no se puede deshacer',
      links: [
        { rel: 'collection', href: `${req.protocol}://${req.get('host')}/productos` },
        { rel: 'home', href: `${req.protocol}://${req.get('host')}/` }
      ],
      meta: {
        timestamp: new Date().toISOString(),
        productos_eliminados: totalEliminados,
        accion: 'purga_completa'
      }
    });

  } catch (error) {
    console.error('[ERROR] Error al purgar productos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudieron eliminar todos los productos',
      links: generateLinks(req)
    });
  }
};