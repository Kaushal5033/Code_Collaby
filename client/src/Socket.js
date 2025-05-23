import { io } from 'socket.io-client';

export const initSocket = async () => {
    const options = {
        reconnectionAttempts: 5,
        timeout: 20000,
        transports: ['websocket', 'polling'], // Use WebSocket and Polling
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
    };
    return io(process.env.REACT_APP_BACKEND_URL, options);
};
