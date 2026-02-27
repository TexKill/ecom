'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { IProduct } from '@/types';

// Props — це "вхідні дані" компонента
// Як аргументи функції, але для React компонентів
interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden
      border border-gray-100 hover:shadow-lg transition-shadow duration-300">

      {/* ── Зображення ── */}
      <Link href={`/products/${product._id}`}>
        <div className="relative h-52 bg-gray-50 overflow-hidden">
          <Image
            src={product.image || '/placeholder.png'}
            alt={product.name}
            fill                        // fill = займає весь батьківський div
            className="object-contain p-4
              transition-transform duration-300
              group-hover:scale-105"    // group-hover: спрацьовує при ховері на батьківський div
          />

          {/* Бейдж "NEW" або знижка */}
          {product.countInStock === 0 && (
            <span className="absolute top-2 left-2 bg-red-500
              text-white text-xs px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      {/* ── Wishlist кнопка ── */}
      <button className="absolute top-3 right-3 p-1.5 bg-white rounded-full
        shadow opacity-0 group-hover:opacity-100
        transition-opacity duration-300">
        <Heart size={16} className="text-gray-600 hover:text-red-500
          transition-colors duration-200" />
      </button>

      {/* ── Інфо про товар ── */}
      <div className="p-4 flex flex-col gap-2">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-medium text-sm text-gray-800
            hover:text-red-500 transition-colors duration-200
            line-clamp-2">         {/* line-clamp-2 = обрізає текст після 2 рядків */}
            {product.name}
          </h3>
        </Link>

        {/* Ціна */}
        <div className="flex items-center gap-2">
          <span className="text-red-500 font-semibold">
            ${product.price.toFixed(2)}   {/* toFixed(2) = завжди 2 знаки після крапки */}
          </span>
        </div>

        {/* Рейтинг */}
        <div className="flex items-center gap-1">
          {/* Генеруємо 5 зірок */}
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < Math.round(product.rating)
                ? 'text-yellow-400'   // заповнена зірка
                : 'text-gray-300'}   // порожня зірка
            >
              ★
            </span>
          ))}
          <span className="text-xs text-gray-400 ml-1">
            ({product.numReviews})
          </span>
        </div>

        {/* Кнопка Add to Cart */}
        <button
          onClick={() => addItem(product)}
          disabled={product.countInStock === 0}
          className="mt-1 flex items-center justify-center gap-2
            bg-black text-white text-sm py-2 rounded
            hover:bg-red-500 transition-colors duration-300
            disabled:bg-gray-300 disabled:cursor-not-allowed"
            // disabled: — Tailwind клас який працює коли кнопка disabled
        >
          <ShoppingCart size={15} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
