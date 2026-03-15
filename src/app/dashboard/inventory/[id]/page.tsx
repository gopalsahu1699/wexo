import ProductDetailsClient from "./ProductDetailsClient";

export function generateStaticParams() {
    return [{ id: 'new' }, { id: 'current' }];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    return <ProductDetailsClient params={params} />;
}
