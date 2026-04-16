import React from 'react';
interface PlaygroundConfigProps {
    onSubmit: (values: {
        appId: string;
        appVersion: string;
        promptType: 'select' | 'custom';
        promptId?: string;
        promptContent?: string;
        input: string;
    }) => void;
    onClear: () => void;
    loading: boolean;
}
declare const PlaygroundConfig: React.FC<PlaygroundConfigProps>;
export default PlaygroundConfig;
