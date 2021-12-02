import Pusher from 'pusher-js';

const { PUSHER_KEY } = process.env;
export const pusher = new Pusher(PUSHER_KEY, {
  cluster: 'ap1',
});
