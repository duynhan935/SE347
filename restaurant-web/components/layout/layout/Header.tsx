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
                        <Link href="/app" className="text-brand-black ">
                            Get the app
                        </Link>
                        <Link href="/about" className="text-brand-black ">
                            About
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center text-brand-black  cursor-pointer">
                                Page
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <Link href="/restaurants">Restaurants</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/cart">Cart</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/checkout">Checkout</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/contact">Contact</Link>
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
                        <Link href="/login">
                            <Button variant="ghost" className="hover:text-brand-purpledark cursor-pointer">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-brand-purple hover:bg-brand-purpledark text-brand-white px-6 cursor-pointer">
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
