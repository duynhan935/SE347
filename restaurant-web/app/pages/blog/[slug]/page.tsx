export default function BlogDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = params;

    return <h1 className="text-3xl font-bold underline">Blog Post: {slug}</h1>;
}
