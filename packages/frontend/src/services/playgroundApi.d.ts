export interface RunPlaygroundRequest {
    appId: string;
    appVersion: string;
    promptId?: string;
    promptContent?: string;
    input: string;
    config?: Record<string, unknown>;
}
export interface PlaygroundResult {
    output: string;
    usage: {
        inputTokens: number;
        outputTokens: number;
    };
    duration: number;
}
export interface PlaygroundStreamEvent {
    type: 'chunk' | 'done' | 'error';
    data?: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
    duration?: number;
    error?: string;
}
export type StreamCallback = (event: PlaygroundStreamEvent) => void;
declare class PlaygroundApi {
    private socket;
    /**
     * 非流式执行 Playground
     */
    run(request: RunPlaygroundRequest): Promise<PlaygroundResult>;
    /**
     * SSE 流式执行 Playground
     */
    runStreamSSE(request: RunPlaygroundRequest, onEvent: StreamCallback): Promise<void>;
    /**
     * WebSocket 流式执行 Playground
     */
    runStreamWebSocket(request: RunPlaygroundRequest, onEvent: StreamCallback): () => void;
    /**
     * 停止 Playground
     */
    stop(): void;
    /**
     * 断开 WebSocket 连接
     */
    disconnect(): void;
}
export declare const playgroundApi: PlaygroundApi;
export default playgroundApi;
