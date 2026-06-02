export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Check for _ga_f cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const hasCookie = cookieHeader.includes('_ga_f=');
  
  // Extract tracking parameters from URL
  const channel_id = url.searchParams.get('channel_id');
  const utm_campaign = url.searchParams.get('utm_campaign');
  const utm_adset = url.searchParams.get('utm_adset');
  const utm_ad = url.searchParams.get('utm_ad');
  
  // Check if ALL tracking parameters exist
  const hasAllTrackingParams = channel_id && utm_campaign && utm_adset && utm_ad;
  
  // Routing logic:
  // 1. If has cookie OR has all params → serve index.html
  // 2. Otherwise → redirect to https://ifanspro.xyz/
  if (hasCookie || hasAllTrackingParams) {
    // Let Cloudflare Pages serve the static index.html file
    const response = await context.next();
    
    // If no cookie but has all params, set a new _ga_f cookie
    if (!hasCookie && hasAllTrackingParams) {
      // Generate random _ga_f cookie value with format GA.xxxxxxxx
      const randomPart = Math.random().toString(36).substring(2, 10);
      const gaValue = `GA.${randomPart}`;
      
      // Set the cookie in the response
      response.headers.set(
        'Set-Cookie',
        `_ga_f=${gaValue}; Path=/; Max-Age=31536000; SameSite=Lax`
      );
      
      // Add cache control for better performance
      response.headers.set('Cache-Control', 'public, max-age=3600');
    }
    
    return response;
  } else {
    // No cookie and missing parameters → redirect
    return Response.redirect('https://ifanspro.xyz/', 302);
  }
}
