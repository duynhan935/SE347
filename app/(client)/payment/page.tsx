// File: app/payment/page.tsx

import PaymentPageContainer from "@/components/client/Payment/PaymentPageContainer";
import { Suspense } from "react";

export default function PaymentPage() {
    return (
        <section>
            <Suspense fallback={<div className="p-4">Loading...</div>}>
                <PaymentPageContainer />
            </Suspense>
        </section>
    );
}
