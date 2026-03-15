import EditTaskClient from './EditTaskClient';

export function generateStaticParams() {
    return [{ id: 'current' }];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    return <EditTaskClient params={params} />;
}
