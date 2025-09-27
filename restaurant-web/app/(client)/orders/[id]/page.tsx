import OrderDetailPageContainer from "@/components/client/OrderDetail/OrderDetailContainer";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
        return (
                <section>
                        <OrderDetailPageContainer params={params} />
                </section>
        );
}
