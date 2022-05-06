import Pusher from 'pusher-js';

const { PUSHER_KEY, PUSHER_HOST } = process.env;
let host = '';
let port = '';

if (PUSHER_HOST.length > 0) {
  [, host] = PUSHER_HOST.split('://');
  [host, port] = host.split(':');
}

const config = host.length > 0 && port.length > 0
  ? {
    wsHost: host,
    wsPort: Number(port),
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
  } : { cluster: 'ap1' };

export const pusher = new Pusher(PUSHER_KEY, config);
