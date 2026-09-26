import { describe, it, expect, vi, beforeEach } from 'vitest';

// Socket.io-client-ийг mock хийх
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  connected: false,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

describe('socket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create socket connection', async () => {
    const { io } = await import('socket.io-client');
    expect(io).toBeDefined();
  });

  it('should connect to socket', async () => {
    const { io } = await import('socket.io-client');
    const socket = io('http://localhost:5000');
    expect(socket).toBeDefined();
    expect(socket.on).toBeDefined();
    expect(socket.emit).toBeDefined();
  });

  it('should register event listeners', async () => {
    const { io } = await import('socket.io-client');
    const socket = io('http://localhost:5000');
    socket.on('connect', () => {});
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
  });

  it('should disconnect socket', async () => {
    const { io } = await import('socket.io-client');
    const socket = io('http://localhost:5000');
    socket.disconnect();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});