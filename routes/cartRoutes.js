// routes/cartRoutes.js
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { productos } = require('../data.js');

const router = express.Router();

// Carritos por usuario en memoria: { [userId]: [ {id, cantidad, precio, nombre, img, subtotal} ] }
const carritos = new Map();

/** Helpers */
const getUserCart = (userId) => {
  if (!carritos.has(userId)) carritos.set(userId, []);
  return carritos.get(userId);
};
const findProduct = (id) => productos.find(p => p.id == id);
const calcTotals = (cart) => {
  const subtotal = cart.reduce((acc, it) => acc + it.subtotal, 0);
  const items = cart.reduce((acc, it) => acc + it.cantidad, 0);
  return { items, subtotal };
};

/** Obtener carrito del usuario */
router.get('/carrito', authMiddleware, (req, res) => {
  const cart = getUserCart(req.user.id);
  res.json({ cart, ...calcTotals(cart) });
});

/** Agregar producto al carrito: { id, cantidad } */
router.post('/carrito/add', authMiddleware, (req, res) => {
  const { id, cantidad } = req.body;
  const userId = req.user.id;

  if (!id || !Number.isInteger(cantidad) || cantidad <= 0) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const producto = findProduct(id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  if (producto.stock < cantidad) {
    return res.status(400).json({ error: `Stock insuficiente. Disponible: ${producto.stock}` });
  }

  // Descontar stock al agregar (reserva)
  producto.stock -= cantidad;

  const cart = getUserCart(userId);
  const idx = cart.findIndex(it => it.id == id);

  if (idx >= 0) {
    cart[idx].cantidad += cantidad;
    cart[idx].subtotal = cart[idx].cantidad * cart[idx].precio;
  } else {
    cart.push({
      id: producto.id,
      nombre: producto.nombre,
      equipo: producto.equipo,
      cantidad,
      precio: producto.precio,
      img: producto.img,
      subtotal: producto.precio * cantidad
    });
  }

  res.json({ message: 'Producto agregado', cart, ...calcTotals(cart) });
});

/** Actualizar cantidad: params.productId, body: { cantidad } (nueva) */
router.put('/carrito/update/:productId', authMiddleware, (req, res) => {
  const { productId } = req.params;
  const { cantidad } = req.body;
  const userId = req.user.id;

  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const producto = findProduct(productId);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  const cart = getUserCart(userId);
  const idx = cart.findIndex(it => it.id == productId);
  if (idx < 0) return res.status(404).json({ error: 'Item no está en el carrito' });

  const actual = cart[idx].cantidad;
  const delta = cantidad - actual;

  // Si delta > 0, intenta reservar más stock; si delta < 0, se regresa stock
  if (delta > 0) {
    if (producto.stock < delta) {
      return res.status(400).json({ error: `Stock insuficiente para aumentar. Disponible: ${producto.stock}` });
    }
    producto.stock -= delta;
  } else if (delta < 0) {
    producto.stock += Math.abs(delta);
  }

  cart[idx].cantidad = cantidad;
  cart[idx].subtotal = cantidad * cart[idx].precio;

  res.json({ message: 'Cantidad actualizada', cart, ...calcTotals(cart) });
});

/** Eliminar producto del carrito (devuelve stock reservado) */
router.delete('/carrito/remove/:productId', authMiddleware, (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const producto = findProduct(productId);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  const cart = getUserCart(userId);
  const idx = cart.findIndex(it => it.id == productId);
  if (idx < 0) return res.status(404).json({ error: 'Item no está en el carrito' });

  // devolver stock
  producto.stock += cart[idx].cantidad;
  cart.splice(idx, 1);

  res.json({ message: 'Producto eliminado', cart, ...calcTotals(cart) });
});

/** Vaciar carrito (devuelve todo el stock reservado) */
router.delete('/carrito/clear', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const cart = getUserCart(userId);

  for (const it of cart) {
    const producto = findProduct(it.id);
    if (producto) producto.stock += it.cantidad;
  }

  carritos.set(userId, []);

  res.json({ message: 'Carrito vaciado', cart: [], items: 0, subtotal: 0 });
});

/** Pago simple: { cantidadPagada } (verifica que alcanza y limpia carrito) */
router.post('/pago', authMiddleware, (req, res) => {
  const { cantidadPagada } = req.body;
  const userId = req.user.id;
  const cart = getUserCart(userId);
  const { subtotal } = calcTotals(cart);

  if (subtotal <= 0) return res.status(400).json({ error: 'Carrito vacío' });
  const pago = Number(cantidadPagada);

  if (!Number.isFinite(pago) || pago < subtotal) {
    return res.status(400).json({ error: `Debe pagar al menos $${subtotal}` });
  }

  // En este punto, el stock ya estaba reservado. Confirmamos compra y limpiamos carrito.
  carritos.set(userId, []);
  res.json({ message: `Pago exitoso de $${pago}. ¡Gracias por su compra!` });
});

module.exports = router;