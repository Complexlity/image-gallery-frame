export const WARPCAST_FRAME_URL = 'https://warpcast.com/~/developers/frames-legacy?url=';
export const GALLERY_KV_KEY = 'gallery_by_date';

export const HOST = process.env.NEXT_PUBLIC_HOST || process.env.HOST || 'http://localhost:3000';

export const ENVI = !!process.env.ENVI ? process.env.ENVI : "devv"
console.log("ENVI", ENVI)