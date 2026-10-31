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

// Google Forms only render inside an iframe when the link carries embedded=true.
function embedUrl(value) {
    const href = safeUrl(value);
    if (!href) return '';
    const u = new URL(href);
    if (u.hostname === 'docs.google.com' && u.pathname.includes('/forms/') && u.pathname.endsWith('/viewform')) {
        u.searchParams.set('embedded', 'true');
    }
    return u.href;
}

// Accepts a Google Sheets "Publish to web" link and returns its CSV form, or '' if it is not one.
function normalizeSheetUrl(value) {
    try {
        const u = new URL(value);
        if (u.protocol !== 'https:' || u.hostname !== 'docs.google.com') return '';
        if (!u.pathname.includes('/spreadsheets/d/e/') || !u.pathname.includes('/pub')) return '';
        u.pathname = u.pathname.replace(/\/pubhtml$/, '/pub');
        u.searchParams.set('output', 'csv');
        return u.href;
    } catch { return ''; }
}

// Minimal CSV parser that handles quoted cells, escaped quotes and line breaks inside cells.
function parseCsv(text) {
    const rows = [];
    let row = [], cell = '', quoted = false;
    text = text.replace(/^\ufeff/, '');
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quoted) {
            if (c === '"') {
                if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
            } else cell += c;
        } else if (c === '"') quoted = true;
        else if (c === ',') { row.push(cell); cell = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i++;
            row.push(cell); cell = ''; rows.push(row); row = [];
        } else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.some(x => x !== ''));
}
