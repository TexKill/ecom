import { Product } from "../models/Product";

const randomStockValue = () => Math.floor(Math.random() * 100) + 1;

export const restockProductsRandom = async (): Promise<number> => {
  const products = await Product.find({}, "_id").lean();
  if (products.length === 0) return 0;

  const ops = products.map((product) => ({
    updateOne: {
      filter: { _id: product._id },
      update: { $set: { countInStock: randomStockValue() } },
    },
  }));

  await Product.bulkWrite(ops);
  return products.length;
};
