import api from './api';
import { io } from 'socket.io-client';
class PlaygroundApi {
    socket = null;
    /**
     * 非流式执行 Playground
     */
    async run(request) {
        const response = await api.post('/playground/run', request);
        return response.data;
    }
    /**
     * SSE 流式执行 Playground
     */
    async runStreamSSE(request, onEvent) {
        const response = await fetch('/api/playground/run/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
            body: JSON.stringify(request),
        });
        if (!response.body) {
            throw new Error('No response body');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            onEvent(data);
                            if (data.type === 'done' || data.type === 'error') {
                                return;
                            }
                        }
                        catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    /**
     * WebSocket 流式执行 Playground
     */
    runStreamWebSocket(request, onEvent) {
        if (!this.socket) {
            this.socket = io('/playground');
        }
        const socket = this.socket;
        socket.on('connect', () => {
            socket.emit('playground:run', request);
        });
        socket.on('playground:stream', (event) => {
            onEvent(event);
        });
        socket.on('playground:error', (error) => {
            onEvent({
                type: 'error',
                error: error.message,
            });
        });
        // 返回清理函数
        return () => {
            socket.off('playground:stream');
            socket.off('playground:error');
        };
    }
    /**
     * 停止 Playground
     */
    stop() {
        if (this.socket) {
            this.socket.emit('playground:stop');
        }
    }
    /**
     * 断开 WebSocket 连接
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}
export const playgroundApi = new PlaygroundApi();
export default playgroundApi;
