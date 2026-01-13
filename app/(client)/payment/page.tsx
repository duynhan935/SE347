import PaymentPageContainer from "@/components/client/Payment/PaymentPageContainer";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { Suspense } from "react";

export default function PaymentPage() {
    return (
        <section>
            <Suspense fallback={<GlobalLoader label="Loading" sublabel="Setting up checkout" />}>
                <PaymentPageContainer />
            </Suspense>
        </section>
    );
}
