import Link from "next/link";

export default function Header() {
    return (
        <header className="p-4 bg-gray-800 text-white">
            <nav>
                <ul style={{ display: "flex", gap: "16px", listStyle: "none", padding: 0, margin: 0 }}>
                    <li>
                        <Link href="/">Trang chủ</Link>
                    </li>
                    <li>
                        <Link href="/restaurants        ">Nhà hàng</Link>
                    </li>
                    <li>
                        <Link href="/cart">Giỏ hàng</Link>
                    </li>
                    <li>
                        <Link href="/checkout">Thanh toán</Link>
                    </li>
                    <li>
                        <Link href="/account">Tài khoản</Link>
                    </li>
                    <li>
                        <Link href="/contact">Liên hệ</Link>
                    </li>
                    <li>
                        <Link href="/admin">Admin</Link>
                    </li>
                    <li>
                        <Link href="/merchant">Merchant</Link>
                    </li>
                    <li>
                        <Link href="/login">Đăng nhập</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
