import CustomerDetailsClient from './CustomerDetailsClient';

export function generateStaticParams() {
    return [{ id: 'new' }, { id: 'current' }];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    return <CustomerDetailsClient params={params} />;
}
