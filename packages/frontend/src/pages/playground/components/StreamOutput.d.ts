import React from 'react';
interface StreamOutputProps {
    output: string;
    isStreaming: boolean;
    usage: {
        inputTokens: number;
        outputTokens: number;
    } | null;
    duration: number | null;
}
declare const StreamOutput: React.FC<StreamOutputProps>;
export default StreamOutput;
