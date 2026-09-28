import { io, Socket } from 'socket.io-client';
import { store } from '../app/store';
import { addNotification } from '../features/notification/notificationSlice';

let socket: Socket | null = null;

export function connectSocket(userId: string): Socket {
  if (socket?.connected) return socket;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Token-ийг localStorage-аас авах (эсвэл таны хадгалж байгаа газраас)
  const token = localStorage.getItem('accessToken') || 
                store.getState().auth.accessToken;

  socket = io(apiUrl, {
    withCredentials: true,
    auth: {
      token: token, // ⬅️ Энэ мөр нэмэгдсэн
    },
    transports: ['websocket', 'polling'], // Render-д тогтвортой байх
  });

  socket.on('connect', () => {
    console.log('Socket холбогдлоо');
    socket!.emit('user:join', userId);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket холболтын алдаа:', err.message);
  });

  // Real-time notification listener
  socket.on('notification:new', (notification) => {
    store.dispatch(addNotification(notification));
  });

  socket.on('disconnect', () => {
    console.log('Socket салсан');
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}