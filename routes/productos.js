import express from 'express';
import {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  purgarProductos
} from '../controllers/productosController.js';

const router = express.Router();

// GET /productos - Obtener todos los productos (con paginación y filtros)
router.get('/', obtenerProductos);

// GET /productos/:id - Obtener un producto específico por ID
router.get('/:id', obtenerProductoPorId);

// POST /productos - Crear un nuevo producto
router.post('/', crearProducto);

// PUT /productos/:id - Actualizar un producto existente
router.put('/:id', actualizarProducto);

// DELETE /productos/purge - Eliminar todos los productos (debe ir antes que /:id)
router.delete('/purge', purgarProductos);

// DELETE /productos/:id - Eliminar un producto específico
router.delete('/:id', eliminarProducto);

export default router;