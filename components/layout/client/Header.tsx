"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/constants";
import { useState } from "react";

export default function Header() {
    const [open, setOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    return (
        <header className="bg-brand-yellowlight px-6 py-4">
            <div className="custom-container">
                <div className="max-w-7xl mx-auto flex items-center justify-between relative">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <Image src={Logo} alt="FoodEats Logo" width={120} height={40} className="h-8 w-auto" />
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="/app" className="text-brand-black text-p2 font-manrope hover:text-brand-purpledark">
                            Get the app
                        </Link>
                        <Link
                            href="/about"
                            className="text-brand-black text-p2 font-manrope hover:text-brand-purpledark"
                        >
                            About
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center text-brand-black cursor-pointer text-p2 font-manrope">
                                Page
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="border border-brand-grey shadow-lg">
                                <DropdownMenuItem className="cursor-pointer">
                                    <Link href="/restaurants">Restaurants</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Link href="/cart">Cart</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Link href="/checkout">Checkout</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Link href="/contact">Contact</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Link href="/admin">Admin</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Link href="/merchant/testmerchantid">Merchant</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex flex items-center space-x-3">
                        <Link href="/login">
                            <Button
                                variant="ghost"
                                className="hover:text-brand-purpledark cursor-pointer font-semibold font-manrope text-button2"
                            >
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-brand-black hover:bg-brand-purpledark px-6 cursor-pointer font-semibold font-manrope text-button2 text-brand-white">
                                Sign Up
                            </Button>
                        </Link>
                    </div>

                    {/* Nút menu */}
                    <button
                        className="md:hidden p-2 rounded focus:outline-none cursor-pointer"
                        onClick={() => setOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="w-7 h-7 text-brand-black" />
                    </button>

                    {/* Mobile menu  */}
                    <div
                        className={`fixed top-0 right-0 h-full w-72 bg-brand-yellowlight shadow-lg z-[100] transform transition-transform duration-300 ${
                            open ? "translate-x-0" : "translate-x-full"
                        }`}
                    >
                        <div className="flex justify-end p-4">
                            <button
                                className="p-2 rounded focus:outline-none cursor-pointer"
                                onClick={() => setOpen(false)}
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6 text-brand-black" />
                            </button>
                        </div>
                        <nav className="flex flex-col items-start px-6 py-4 space-y-4">
                            {isLoggedIn ? (
                                <>
                                    <Link
                                        href="/app"
                                        className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                                    >
                                        Get the app
                                    </Link>
                                    <Link
                                        href="/about"
                                        className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                                    >
                                        About
                                    </Link>
                                    <Link
                                        href="/restaurants"
                                        className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                                    >
                                        Restaurants
                                    </Link>
                                    <Link
                                        href="/cart"
                                        className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                                    >
                                        Cart
                                    </Link>
                                    <Link
                                        href="/checkout"
                                        className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                                    >
                                        Checkout
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                                    >
                                        Contact
                                    </Link>
                                    <Link
                                        href="/admin"
                                        className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                                    >
                                        Admin
                                    </Link>
                                    <Link
                                        href="/merchant"
                                        className="text-brand-black text-p2 font-manrope w-full py-2 hover:text-brand-purpledark"
                                    >
                                        Merchant
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="w-full">
                                        <Button
                                            variant="ghost"
                                            className="w-full text-left hover:text-brand-purpledark cursor-pointer font-semibold font-manrope text-button2"
                                        >
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/register" className="w-full">
                                        <Button className="w-full text-left bg-brand-black hover:bg-brand-purpledark px-6 cursor-pointer font-semibold font-manrope text-button2 text-brand-white">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>

                    {/* Overlay khi mở menu */}
                    {open && <div className="fixed inset-0 bg-black/30 z-[99]" onClick={() => setOpen(false)} />}
                </div>
            </div>
        </header>
    );
}
