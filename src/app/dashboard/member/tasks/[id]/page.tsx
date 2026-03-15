import MemberTaskDetailsClient from "./MemberTaskDetailsClient";

export function generateStaticParams() {
    return [{ id: 'current' }];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    return <MemberTaskDetailsClient params={params} />;
}
