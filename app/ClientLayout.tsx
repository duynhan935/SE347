"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/client/Header";
import Footer from "@/components/layout/client/Footer";

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
