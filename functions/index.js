export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Read cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const hasCookie = cookieHeader.includes('_ga_f=');

  // Read tracking parameters
  const channel_id = url.searchParams.get('channel_id');
  const utm_campaign = url.searchParams.get('utm_campaign');
  const utm_adset = url.searchParams.get('utm_adset');
  const utm_ad = url.searchParams.get('utm_ad');

  const hasAllTrackingParams = Boolean(
    channel_id && utm_campaign && utm_adset && utm_ad
  );

  // If neither cookie nor complete tracking parameters exist, redirect.
  if (!hasCookie && !hasAllTrackingParams) {
    return Response.redirect('https://ifanspro.xyz/', 302);
  }

  // Continue to Cloudflare Pages static asset handling.
  // For the root path '/', this lets Pages return ./index.html.
  const originResponse = await context.next();

  // Clone the response before modifying headers.
  const response = new Response(originResponse.body, originResponse);

  // If this is the first qualified entry, set _ga_f cookie.
  if (!hasCookie && hasAllTrackingParams) {
    const randomPart = Math.random().toString(36).substring(2, 10);
    const gaValue = `GA.${randomPart}`;

    response.headers.set(
      'Set-Cookie',
      `_ga_f=${gaValue}; Path=/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly`
    );
  }

  // Do not cache HTML routed through the Function.
  // Static assets are cached separately by _headers.
  response.headers.set('Cache-Control', 'no-store');

  return response;
}