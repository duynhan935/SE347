import DeliveryStatusPageContainer from "@/components/client/Delivery/DeliveryStatusPageContainer";

export default function DeliveryStatusPage({ params }: { params: { slug: string } }) {
        return (
                <section>
                        <DeliveryStatusPageContainer params={params} />
                </section>
        );
}
