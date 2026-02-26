import Link from "next/link";
import { Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">TexKillDev</h2>
          <p className="text-sm text-gray-400">
            Subscribe to get updates on promotions and coupons.
          </p>
          <form className="flex items-center border border-gray-600 rounded px-3 py-2 gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent outline-none text-sm text-white w-full placeholder-gray-500"
            />
            <button type="submit">
              <Send size={16} className="text-white" />
            </button>
          </form>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-base">Support</h3>
          <p className="text-sm text-gray-400">
            15 Soniachna St, Apt. 24, Kyiv, 03150, Ukraine
          </p>
          <p className="text-sm text-gray-400">texkilldev@gmail.com</p>
          <p className="text-sm text-gray-400">+380 44 123 4567</p>
        </div>

        {/* Account */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-base">Account</h3>
          <ul className="flex flex-col gap-2 text-sm text-gray-400">
            <li>
              <Link href="/account" className="hover:text-white">
                My Account
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white">
                Login / Register
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-white">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-white">
                Shop
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-base">Quick Link</h3>
          <ul className="flex flex-col gap-2 text-sm text-gray-400">
            <li>
              <Link href="#" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Terms Of Use
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © Copyright {new Date().getFullYear()} TexKillDev
      </div>
    </footer>
  );
}
