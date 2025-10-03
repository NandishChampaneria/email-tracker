export function rewriteLinks(html: string, uid: string, appBaseUrl: string): string {
    return html.replace(/href=\"([^\"]+)\"/g, (m, p1) => {
        const tracked = `${appBaseUrl}/track/click?id=${encodeURIComponent(uid)}&url=${encodeURIComponent(p1)}`;
        return `href=\"${tracked}\"`;
    });
}

export function injectPixel(html: string, uid: string, appBaseUrl: string): string {
    const ts = Date.now();
    const pixel = `<img src="${appBaseUrl}/track/open?id=${encodeURIComponent(uid)}&ts=${ts}" alt="" width="1" height="1" style="opacity:0;display:block" aria-hidden="true" />`;
    if (html.includes('</body>')) return html.replace('</body>', `${pixel}</body>`);
    return html + pixel;
}


