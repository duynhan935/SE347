"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
        href: string;
        label: string;
        pathname: string;
}

function NavLink({ href, label, pathname }: NavLinkProps) {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

        return (
                <Link
                        href={href}
                        prefetch={true}
                        className={`relative text-p2 font-manrope font-medium transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-brand-orange after:transition-all after:duration-300 ${
                                isActive
                                        ? "text-brand-orange font-semibold after:w-full"
                                        : "text-brand-black hover:text-brand-orange after:w-0 hover:after:w-full"
                        }`}
                >
                        {label}
                </Link>
        );
}

export default function NavigationLinks() {
        const pathname = usePathname();

        return (
                <nav className="hidden lg:flex items-center gap-8">
                        <NavLink href="/restaurants" label="Restaurants" pathname={pathname} />
                        <NavLink href="/about" label="About" pathname={pathname} />
                        <NavLink href="/contact" label="Contact" pathname={pathname} />
                </nav>
        );
}
