const api = process.env.NEXT_PUBLIC_API_URL;
const socket = process.env.NEXT_PUBLIC_SOCKET_URL;

if (!api) {
  throw new Error('Configuration error: NEXT_PUBLIC_API_URL is missing. Please define it in your .env.local file.');
}

if (!socket) {
  throw new Error('Configuration error: NEXT_PUBLIC_SOCKET_URL is missing. Please define it in your .env.local file.');
}

export const env = {
  API_URL: api,
  SOCKET_URL: socket,
};

export default env;
