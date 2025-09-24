import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/constants";

export default function Header() {
    return (
        <header className="bg-brand-yellowlight px-6 py-4">
            <div className="custom-container">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <Image src={Logo} alt="FoodEats Logo" width={120} height={40} className="h-8 w-auto" />
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="/app" className="text-brand-black hover:text-gray-900">
                            Get the app
                        </Link>
                        <Link href="/about" className="text-brand-black hover:text-gray-900">
                            About
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center text-brand-black hover:text-gray-900">
                                Page
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <Link href="/restaurants">Nhà hàng</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/cart">Giỏ hàng</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/checkout">Thanh toán</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/contact">Liên hệ</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/admin">Admin</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/merchant">Merchant</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-3">
                        <Link href="/account">
                            <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6">Sign Up</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
