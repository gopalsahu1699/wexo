import WorkerDetailsClient from './WorkerDetailsClient';

export function generateStaticParams() {
    return [{ id: 'new' }];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    return <WorkerDetailsClient params={params} />;
}
