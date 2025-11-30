"use client";

import { Logo } from "@/constants";
import Image from "next/image";
import Link from "next/link";

export default function LogoComponent() {
        return (
                <Link href="/" prefetch={true} className="flex items-center">
                        <Image src={Logo} alt="FoodEats Logo" width={120} height={40} className="h-8 w-auto" priority />
                </Link>
        );
}
