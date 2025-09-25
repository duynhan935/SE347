"use client";

import Footer from "@/components/layout/layout/Footer";
import Header from "@/components/layout/layout/Header";
import React from "react";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isMerchant = pathname.includes("merchant");

    return (
        <>
            {!isMerchant && <Header />}
            <main>{children}</main>
            {!isMerchant && <Footer />}
        </>
    );
}
