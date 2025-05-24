import React from 'react';
import ColabClient from './ColabClient';

// A minimal component that passes props to the client component
export default function ColabPage({
    params,
    searchParams
}: {
    params: { projectId: string },
    searchParams: Record<string, string | string[] | undefined>
}) {
    const { projectId } = params;
    const token = typeof searchParams.token === 'string' ? searchParams.token : undefined;

    return <ColabClient projectId={projectId} token={token} />;
} 