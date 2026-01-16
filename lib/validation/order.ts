/**
 * Order validation schemas
 */

export interface OrderValidationError {
  field: string;
  message: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderInput {
  items: OrderItemInput[];
}

/**
 * Validate order items
 */
export function validateOrderItems(items: OrderItemInput[]): OrderValidationError[] {
  const errors: OrderValidationError[] = [];

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push({
      field: "items",
      message: "Order must contain at least one item",
    });
    return errors;
  }

  items.forEach((item, index) => {
    if (!item.productId || typeof item.productId !== "string") {
      errors.push({
        field: `items[${index}].productId`,
        message: "Product ID is required",
      });
    }

    if (!item.quantity || typeof item.quantity !== "number" || item.quantity <= 0) {
      errors.push({
        field: `items[${index}].quantity`,
        message: "Quantity must be a positive number",
      });
    }

    if (!item.price || typeof item.price !== "number" || item.price <= 0) {
      errors.push({
        field: `items[${index}].price`,
        message: "Price must be a positive number",
      });
    }
  });

  return errors;
}

/**
 * Validate order input
 */
export function validateOrderInput(input: OrderInput): OrderValidationError[] {
  return validateOrderItems(input.items);
}