// Public client config. The publishable key is safe to ship; access is enforced by Row Level Security.
const SUPABASE_URL = 'https://lerlbumwrxaqifdbsdik.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YR6QwINdscpsgni1NlyCkQ_QciXBuhd';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// Only allow http(s) links so a pasted "javascript:" URL can never run.
function safeUrl(value) {
    try {
        const u = new URL(value);
        return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : '';
    } catch { return ''; }
}

// Resolves relative to the current page, so it keeps the /research-hub/ path on GitHub Pages.
function pageUrl(file, query) {
    const u = new URL(file, window.location.href);
    u.search = query || '';
    u.hash = '';
    return u.href;
}
