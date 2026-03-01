import assert from "node:assert/strict";
import test from "node:test";
import { productIdParamSchema } from "./product";
import { createOrderSchema } from "./order";
import { toggleFavoriteSchema } from "./favorites";
import { syncCartSchema } from "./cart";

test("product id param accepts valid ObjectId", () => {
  const parsed = productIdParamSchema.parse({
    id: "507f1f77bcf86cd799439011",
  });

  assert.equal(parsed.id, "507f1f77bcf86cd799439011");
});

test("product id param rejects invalid ObjectId", () => {
  assert.throws(() => {
    productIdParamSchema.parse({ id: "abc" });
  });
});

test("order schema rejects invalid product id", () => {
  assert.throws(() => {
    createOrderSchema.parse({
      orderItems: [{ product: "bad-id", qty: 1 }],
      shippingAddress: {
        address: "Main 1",
        city: "Kyiv",
        phoneNumber: "+380441234567",
        postalCode: "01001",
        country: "Ukraine",
      },
      paymentMethod: "cash_on_delivery",
    });
  });
});

test("favorites schema requires ObjectId", () => {
  assert.throws(() => {
    toggleFavoriteSchema.parse({ productId: "short" });
  });
});

test("cart schema requires ObjectId", () => {
  assert.throws(() => {
    syncCartSchema.parse({
      items: [
        {
          productId: "short",
          name: "Phone",
          image: "img.png",
          price: 100,
          countInStock: 5,
          qty: 1,
        },
      ],
    });
  });
});
