import OrderDetailPageContainer from "@/components/client/OrderDetail/OrderDetailContainer";

export default function OrderDetailPage({ params }: { params: { slug: string } }) {
        return (
                <section>
                        <OrderDetailPageContainer params={params} />
                </section>
        );
}
