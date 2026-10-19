import { prisma } from '../config/database';

export interface AddToCartData {
  userId: string;
  serviceId: string;
  shopId: string;
  quantity: number;
}

export interface UpdateCartQuantityData {
  userId: string;
  cartItemId: string;
  quantity: number;
}

/** Get all cart items for a user */
export async function getCartItems(userId: string) {
  const cart = await prisma.cart.findUnique({ 
    where: { userId }, 
    include: { items: { include: { item: true } } } 
  });
  return cart?.items || [];
}

/** Add an item to the cart */
export async function addToCart(data: AddToCartData) {
  let cart = await prisma.cart.findUnique({ where: { userId: data.userId } });
  
  if (!cart) {
    cart = await prisma.cart.create({ 
      data: { userId: data.userId, vendorId: data.shopId } 
    });
  }

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, itemId: data.serviceId },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + data.quantity },
    });
  }

  return prisma.cartItem.create({ 
    data: { cartId: cart.id, itemId: data.serviceId, quantity: data.quantity } 
  });
}

/** Update cart item quantity */
export async function updateCartQuantity(data: UpdateCartQuantityData) {
  if (data.quantity <= 0) {
    return removeFromCart(data.cartItemId, data.userId);
  }
  
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: data.cartItemId },
    include: { cart: true }
  });
  
  if (!cartItem || cartItem.cart.userId !== data.userId) {
    throw new Error('Cart item not found');
  }

  return prisma.cartItem.update({
    where: { id: data.cartItemId },
    data: { quantity: data.quantity },
  });
}

/** Remove an item from the cart */
export async function removeFromCart(cartItemId: string, userId: string) {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true }
  });
  
  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new Error('Cart item not found');
  }
  
  return prisma.cartItem.delete({ where: { id: cartItemId } });
}

/** Clear all items from the cart */
export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    return prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}
