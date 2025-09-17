import Link from "next/link";

export default function Header() {
        return (
                <header className="bg-gray-800 shadow">
                        <nav>
                                <ul>
                                        <Link href="pages/about">
                                                <li className="text-blue-500 underline">About Us</li>
                                        </Link>
                                        <Link href="pages/menu">
                                                <li className="text-blue-500 underline">Menu</li>
                                        </Link>
                                        <Link href="pages/contact">
                                                <li className="text-blue-500 underline">Contact</li>
                                        </Link>
                                        <Link href="pages/reservation">
                                                <li className="text-blue-500 underline">Reservation</li>
                                        </Link>
                                        <Link href="pages/blog">
                                                <li className="text-blue-500 underline">Blog</li>
                                        </Link>
                                        <Link href="pages/cart">
                                                <li className="text-blue-500 underline">Cart</li>
                                        </Link>
                                        <Link href="pages/coming-soon">
                                                <li className="text-blue-500 underline">Coming Soon</li>
                                        </Link>
                                        <Link href="pages/product/product-id">
                                                <li className="text-blue-500 underline">Product</li>
                                        </Link>
                                        <Link href="pages/checkout">
                                                <li className="text-blue-500 underline">Checkout</li>
                                        </Link>
                                </ul>
                        </nav>
                </header>
        );
}
