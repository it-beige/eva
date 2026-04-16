import { RunPlaygroundRequest, PlaygroundResult, PlaygroundStreamEvent } from '../services/playgroundApi';
interface PlaygroundState {
    input: string;
    output: string;
    isStreaming: boolean;
    loading: boolean;
    error: string | null;
    usage: {
        inputTokens: number;
        outputTokens: number;
    } | null;
    duration: number | null;
    history: Array<{
        id: string;
        input: string;
        output: string;
        timestamp: number;
    }>;
}
export declare const runPlayground: import("@reduxjs/toolkit").AsyncThunk<PlaygroundResult, RunPlaygroundRequest, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const runPlaygroundStream: import("@reduxjs/toolkit").AsyncThunk<undefined, {
    request: RunPlaygroundRequest;
    onEvent: (event: PlaygroundStreamEvent) => void;
}, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const setInput: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "playground/setInput">, appendOutput: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "playground/appendOutput">, setOutput: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "playground/setOutput">, setStreaming: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "playground/setStreaming">, setUsage: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    inputTokens: number;
    outputTokens: number;
} | null, "playground/setUsage">, setDuration: import("@reduxjs/toolkit").ActionCreatorWithPayload<number | null, "playground/setDuration">, clearOutput: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"playground/clearOutput">, addToHistory: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    input: string;
    output: string;
}, "playground/addToHistory">, clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"playground/clearError">, clearHistory: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"playground/clearHistory">;
declare const _default: import("@reduxjs/toolkit").Reducer<PlaygroundState>;
export default _default;
