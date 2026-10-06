document.getElementById('yr').textContent = new Date().getFullYear();

// mobile menu
const menu = document.getElementById('menu'), links = document.getElementById('links');
menu.addEventListener('click', () => { const o = links.classList.toggle('open'); menu.setAttribute('aria-expanded', o) });
links.addEventListener('click', e => { if (e.target.tagName === 'A') { links.classList.remove('open'); menu.setAttribute('aria-expanded', false) } });

// scroll reveal
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .12 });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el) });

// image fallbacks
function fb(img) { const d = document.createElement('div'); d.className = 'fallback'; d.setAttribute('role', 'img'); d.setAttribute('aria-label', img.alt); d.textContent = img.dataset.fallback; img.replaceWith(d) }
document.querySelectorAll('img[data-fallback]').forEach(img => { img.addEventListener('error', () => fb(img)); if (img.complete && img.naturalWidth === 0) fb(img) });

// tabs (click + arrow keys)
const tabs = [...document.querySelectorAll('[role=tab]')];
function pick(t) { tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on }); t.focus() }
tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t)); t.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') pick(tabs[(i + 1) % tabs.length]); else if (e.key === 'ArrowLeft') pick(tabs[(i - 1 + tabs.length) % tabs.length])
    })
});

// light C# syntax highlighting
document.querySelectorAll('code[data-lang]').forEach(c => {
    const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const re = /(\/\/.*|"(?:[^"\\]|\\.)*")|\b(public|class|interface|where|async|await|return|new|is|null|record|var|using)\b|\b([A-Z]\w+)\b/g;
    const t = c.textContent; let out = '', last = 0, m;
    while ((m = re.exec(t))) { out += esc(t.slice(last, m.index)); const cls = m[1] ? (m[1][0] === '/' ? 'c' : 's') : m[2] ? 'k' : 't'; out += '<span class="' + cls + '">' + esc(m[0]) + '</span>'; last = re.lastIndex }
    c.innerHTML = out + esc(t.slice(last))
});

// contact form: validation, honeypot, time check, toast
// Set ENDPOINT to a Formspree / Web3Forms URL to deliver messages directly; otherwise the visitor's email app opens.
const ENDPOINT = '';
const form = document.getElementById('form'), status = document.getElementById('status'), btn = form.querySelector('.send'), toast = document.getElementById('toast');
const loadedAt = Date.now();
function showToast(msg, type) { toast.textContent = msg; toast.className = 'toast show ' + (type || ''); clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('show'), 5000) }
form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (d.website || Date.now() - loadedAt < 3000) return; // honeypot filled or submitted faster than a human
    const bad = { name: d.name.trim().length < 2, email: !/^\S+@\S+\.\S+$/.test(d.email), subject: d.subject.trim().length < 3, message: d.message.trim().length < 10 };
    Object.entries(bad).forEach(([k, v]) => form.elements[k].setAttribute('aria-invalid', v));
    if (Object.values(bad).some(Boolean)) { status.style.color = '#f6a5a5'; status.textContent = 'Please check the highlighted fields. The message needs at least 10 characters.'; return }
    status.textContent = ''; btn.classList.add('sent');
    try {
        if (ENDPOINT) {
            const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name: d.name, email: d.email, subject: d.subject, message: d.message }) });
            if (!r.ok) throw new Error('send failed');
            showToast('Message sent. Thanks for reaching out, I will reply soon.');
        } else {
            showToast('Message ready. Your email app is opening to send it.');
            setTimeout(() => { location.href = 'mailto:ziad67189@gmail.com?subject=' + encodeURIComponent(d.subject) + '&body=' + encodeURIComponent(d.message + '\n\nFrom: ' + d.name + ' (' + d.email + ')') }, 700);
        }
        form.reset();
    } catch (err) { showToast('Could not send the message. Please email me directly.', 'error') }
    setTimeout(() => btn.classList.remove('sent'), 1200);
});
