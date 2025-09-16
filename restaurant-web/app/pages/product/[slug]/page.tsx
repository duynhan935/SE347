export default function ProductDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = params;

    return <h1 className="text-3xl font-bold underline">Product Detail: {slug}</h1>;
}
