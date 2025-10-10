import DeliveryStatusPageContainer from "@/components/client/Delivery/DeliveryStatusPageContainer";

export default function DeliveryStatusPage({ params }: { params: { id: string } }) {
        return (
                <section>
                        <DeliveryStatusPageContainer params={params} />
                </section>
        );
}
