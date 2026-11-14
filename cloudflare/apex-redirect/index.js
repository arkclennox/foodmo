// foodmo.id → https://www.foodmo.id (same path and query), like Vercel did.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.hostname = 'www.foodmo.id';
    url.port = '';
    return Response.redirect(url.toString(), 301);
  },
};
