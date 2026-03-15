import ViewTaskClient from './ViewTaskClient';

export function generateStaticParams() {
    return [{ id: 'current' }];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    return <ViewTaskClient params={params} />;
}
