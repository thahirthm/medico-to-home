/* eslint-disable */
// @ts-nocheck
"use client";

// The site's client state. Catalogue, login, bookings and records all come from
// the API; only the time slots are still dummy.
import { usePathname, useRouter } from "next/navigation";
import { Component, createContext, useContext } from "react";
import { api, getMe, isMedico, setMode, supabase } from "@/lib/api";
import { MTH, setCatalogue } from "@/prototype/catalogue";
import { MTHL } from "@/prototype/schedule";

const SiteContext = createContext(null);
const GRID_PAGE = 15;
// What the user was doing before Google sign-in sent them away, so it can continue on return.
const PENDING_KEY = "mth-pending-login";
export const useSite = (): any => useContext(SiteContext);

function pathFor(view, proId, bookingId) {
  return { home: "/", about: "/about", join: "/join", apply: "/join/apply", acct: "/account", setup: "/welcome", pro: `/professionals/${proId}`, book: `/book/${proId}`, done: `/bookings/${bookingId}` }[view] ?? "/";
}

function fromPath(path) {
  const [, a, b] = path.split("/");
  if (a === "professionals") return { view: "pro", proId: b };
  if (a === "book") return { view: "book", proId: b };
  if (a === "bookings") return { view: "done", bookingId: b };
  if (a === "about") return { view: "about" };
  if (a === "join") return { view: "join" };
  if (a === "account") return { view: "acct" };
  if (a === "welcome") return { view: "setup" };
  if (a === "legal") return { view: "legal" };
  return { view: "home" };
}

class SiteStore extends Component {
  state = { gridLimit: GRID_PAGE, proId: 'p12', ...fromPath(this.props.pathname), ready: true, w: 1280, authReady: false, patients: [], addresses: [], bookings: [], me: null, live: null, booking: false, scrolled: false, menu: false,
    loc: 'Nadakkavu', locLoading: true, locOpen: false, q: '', qApplied: '', qOpen: false, when: 'Today', whenDate: null, whenOpen: false,
    cat: 'all', sort: 'near', availNow: false, onlineOnly: false, find: '', filtersOpen: false, f: { price: 1600, gender: 'Any', langs: [], exp: 0, rating: 0, dist: 0 },
    gridLoading: true, sos: false, login: false, user: null, therapy: 'knee', toast: '',
    b: null, track: 0, eta: 12, earnS: 20, earnP: 650, faq: -1, proTab: 'about' };

  componentDidMount() {
    // clientWidth, not innerWidth: on phones innerWidth grows to fit the wider desktop first render, so the
    // site would stay in its desktop layout. clientWidth is the real screen width.
    this._rs = () => this.setState({ w: document.documentElement.clientWidth || window.innerWidth }); this._rs();
    this._sc = () => { const s = window.scrollY > 8; if (s !== this.state.scrolled) this.setState({ scrolled: s }); };
    this._md = (e) => { if (!e.target.closest('[data-dd]')) { const s = this.state; if (s.locOpen || s.qOpen || s.whenOpen) this.setState({ locOpen: false, qOpen: false, whenOpen: false }); } };
    window.addEventListener('resize', this._rs); window.addEventListener('scroll', this._sc); document.addEventListener('mousedown', this._md);
    this.startLocation(); this.reveal(); this.ensure();
    if (new URLSearchParams(window.location.search).get('login') === 'patient') { window.history.replaceState(null, '', window.location.pathname); this.setState({ login: true }); }
    // A used or expired email link comes back with an error in the address instead of a session.
    const linkError = new URLSearchParams(window.location.hash.slice(1)).get('error_code') || new URLSearchParams(window.location.search).get('error_code');
    if (linkError) {
      window.history.replaceState(null, '', window.location.pathname);
      this.setState({ login: true }); this.toast(linkError === 'otp_expired' ? 'That sign-in link has expired or was already used. Please ask for a new code.' : 'That sign-in link did not work. Please ask for a new code.');
    }
    supabase.auth.getSession().then(({ data }) => { if (data.session) this.afterAuth().then((me) => { if (this.toMedico(me)) return; if (me.needs_setup) this.toSetup(); else this.resumePending(); }).catch(() => {}).finally(() => this.setState({ authReady: true })); else this.setState({ authReady: true }); });
  }
  componentDidUpdate(prev) {
    if (prev.pathname !== this.props.pathname) this.setState(fromPath(this.props.pathname));
    this.ensure(); this.reveal();
    if (prev.pathname !== this.props.pathname || this._loadedFor !== this.state.proId) this.loadBooked();
  }
  // A page opened directly by URL has no booking in memory yet.
  ensure() {
    const s = this.state;
    if (s.view === 'book' && !s.b) {
      const p = MTH.pros.find(x => x.id === s.proId) || MTH.pros[0];
      this.setState({ proId: p.id, b: { ...this.mkB(p), step: 0 } });
    }
    if (!s.authReady) return;
    if ((s.view === 'acct' || s.view === 'done' || s.view === 'setup') && !s.user && !s.login && !this._loginAsked) { this._loginAsked = true; this.setState({ login: true }); }
    if (s.view === 'acct' && s.user && !s.acct) this.setState({ acct: this.buildAcct() });
    if (s.view === 'done' && s.user && s.bookingId) this.watchBooking(s.bookingId); else { clearInterval(this._ti); this._watching = null; }
  }
  loadBooked() {
    const id = this.state.proId; if (!id || this._loadedFor === id) return; this._loadedFor = id;
    api(`/professionals/${id}/booked`).then(r => { MTHL.setBooked(id, r); this.forceUpdate(); }).catch(() => {});
  }
  async afterAuth() {
    const [me, patients, addresses, bookings] = await Promise.all([getMe(), api('/patients'), api('/addresses'), api('/bookings')]);
    this.setState({ me, patients, addresses, bookings, user: (me.full_name || 'there').split(' ')[0], acct: null });
    // Returned too, because this.state is not updated yet when the caller continues.
    return me;
  }
  // A new account fills in the registration page before anything else; it returns where it came from.
  toSetup() {
    if (this.state.view !== 'setup') this._setupFrom = this.state.view;
    this.setState({ login: false }); this.go('setup');
  }
  resumePending() {
    let pending = null; try { pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null'); sessionStorage.removeItem(PENDING_KEY); } catch {}
    if (!pending) return;
    this.toast('You are logged in');
    this.setState(pending.b ? { b: pending.b, proId: pending.proId } : {}, () => this.continueAfterLogin(pending.to));
  }
  // A Medico working in professional mode belongs on their dashboard, not the patient site. "Patient mode" there switches back.
  toMedico(me) {
    if (!me || me.last_mode !== 'professional' || !isMedico(me)) return false;
    window.location.replace('/pro'); return true;
  }
  // After signing in: finish what the user started, or open the mode they used last.
  continueAfterLogin(to) {
    const me = this.state.me;
    if (to === 'confirm') this.confirm();
    else if (to) this.go(to);
    else this.toMedico(me);
  }
  // Where this account's application stands, shown on the Join page. The form itself lives at /join/apply.
  joinState() {
    const s = this.state; const app = s.me && s.me.application; const stage = app ? app.stage : '';
    const STAGE = { documents: 'Checking your documents', council: 'Checking your council registration', police: 'ID and police clearance check', interview: 'Interview' };
    return {
      joinInReview: !!STAGE[stage], joinStage: STAGE[stage] || '', joinProfession: app ? app.profession : '',
      joinApproved: stage === 'approved' || !!(s.me && s.me.professional), joinNote: app && ['info_needed', 'rejected'].includes(stage) ? app.decision_note : '',
      joinNoteTitle: stage === 'info_needed' ? 'We need a few more details' : 'Your last application was not approved',
      joinButton: stage === 'info_needed' ? 'Update your application' : stage === 'rejected' ? 'Apply again' : 'Start your application',
    };
  }
  // Booking fields from a saved address. Its locality must be one of our areas; if it is blank or unknown, the area chosen on the site is used.
  addrFields(a) {
    const loc = this.state.loc; const known = a && MTH.LOCS[a.locality];
    if (!a) return { addr: 'new', addressId: undefined, house: '', street: '', landmark: '', locality: loc, pin: (MTH.LOCS[loc] || [])[3] || '' };
    return { addr: a.id, addressId: a.id, house: a.house, street: a.street, landmark: a.landmark, locality: known ? a.locality : loc, pin: a.pincode || (MTH.LOCS[known ? a.locality : loc] || [])[3] || '' };
  }
  refreshBookings() { return api('/bookings').then(bookings => this.setState({ bookings })).catch(() => {}); }
  watchBooking(id) {
    if (this._watching === id) return; this._watching = id; clearInterval(this._ti); this.setState({ live: null });
    const load = () => api(`/bookings/${id}`).then(live => {
      const p = MTH.pros.find(x => x.id === live.professional_id) || MTH.pros[0];
      this.setState(x => ({ live, proId: p.id, b: x.b || this.mkB(p) }));
    }).catch(e => { clearInterval(this._ti); this.toast(e.message); });
    load(); this._ti = setInterval(load, 8000);
  }
  buildAcct() {
    const s = this.state; const members = {};
    s.patients.forEach(x => { members[x.id] = { ...x, phone: '' }; });
    const self = s.patients.find(x => x.rel === 'Me');
    return { tab: 'records', member: self ? self.id : Object.keys(members)[0], edit: false, d: { cond: '', since: '', alg: '', medN: '', medD: '', medF: 'Once daily', hT: '', hN: '' },
      info: { name: s.me.full_name, phone: s.me.phone || '', email: s.me.email, dob: s.me.dob, emerg: s.me.emergency_contact }, members };
  }
  savePatient(id) {
    clearTimeout(this._sv);
    this._sv = setTimeout(() => { const m = this.state.acct && this.state.acct.members[id]; if (!m) return;
      api(`/patients/${id}`, { method: 'PUT', body: { rel: m.rel, name: m.name, age: m.age, gender: m.gender, blood: m.blood, h: m.h, w: m.w, conds: m.conds, alg: m.alg, meds: m.meds, hist: m.hist, share: m.share } }).catch(e => this.toast(e.message)); }, 500);
  }
  uploadReport(id) {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.pdf,image/*';
    input.onchange = async () => { const file = input.files && input.files[0]; if (!file) return;
      try {
        this.toast('Uploading…');
        const { uploadUrl, path } = await api(`/patients/${id}/documents/sign`, { body: { fileName: file.name, size: file.size } });
        const up = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file });
        if (!up.ok) throw new Error('Upload failed. Please try again.');
        const doc = await api(`/patients/${id}/documents`, { body: { fileName: file.name, path, size: file.size } });
        this.setState(x => { const a = JSON.parse(JSON.stringify(x.acct)); a.members[id].reps.unshift(doc); return { acct: a }; });
        this.toast('Report uploaded');
      } catch (e) { this.toast(e.message); } };
    input.click();
  }
  componentWillUnmount() { window.removeEventListener('resize', this._rs); window.removeEventListener('scroll', this._sc); document.removeEventListener('mousedown', this._md); clearInterval(this._ti); }
  reveal() {
    if (!window.IntersectionObserver) return;
    if (!this._io) this._io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = 'none'; this._io.unobserve(e.target); } }), { threshold: .08 });
    document.querySelectorAll('[data-reveal]:not([data-rv])').forEach(el => { el.setAttribute('data-rv', '1'); el.style.opacity = 0; el.style.transform = 'translateY(16px)'; el.style.transition = 'opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)'; this._io.observe(el); });
  }
  // Distances are measured from the user's exact position when we have it, else from the chosen area.
  at() { return this.state.here || this.state.loc; }
  startLocation() {
    let saved = null, here = null; try { saved = localStorage.getItem('mth-loc'); here = JSON.parse(localStorage.getItem('mth-here') || 'null'); } catch {}
    if (saved && MTH.LOCS[saved]) this.setState({ loc: saved, here, locLoading: false, gridLoading: false }); else this.detect();
  }
  // An area picked from the list replaces the exact position; detect() keeps it.
  pickLoc(name, here = null) {
    this.setState({ loc: name, here, outside: null, locOpen: false, locLoading: false });
    try { localStorage.setItem('mth-loc', name); if (here) localStorage.setItem('mth-here', JSON.stringify(here)); else localStorage.removeItem('mth-here'); } catch {}
  }
  detect() {
    this.setState({ locLoading: true, gridLoading: false, locOpen: false });
    const stop = (msg) => { this.setState({ locLoading: false }); if (msg) this.toast(msg); };
    if (!navigator.geolocation) return stop('Location is not available in this browser. Please pick your area.');
    // A fresh, precise fix (GPS on phones), not a cached or network-only guess.
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      try {
        const n = await api(`/localities/nearest?lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}`);
        const here = { lat, lng, accuracy: Math.round(accuracy), label: n.place ? n.place.label : 'Your location', address: n.place ? n.place.address : `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
        this.setState({ nearby: n.nearest });
        if (n.covered) { this.pickLoc(n.nearest[0].name, here); stop('Showing care near ' + here.label); this.flash(); }
        // Outside our areas: show where they are and let them choose a nearby area we serve.
        else this.setState({ outside: here, locOpen: true, locLoading: false });
      } catch (e) { stop(e.message); }
    }, (err) => stop(err.code === 1 ? 'Location permission is off. Please pick your area.' : 'Could not find your location. Please pick your area.'), { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  }
  flash() { this.setState({ gridLoading: true, gridLimit: GRID_PAGE }); clearTimeout(this._fl); this._fl = setTimeout(() => this.setState({ gridLoading: false }), 420); }
  toast(t) { this.setState({ toast: t }); clearTimeout(this._tt); this._tt = setTimeout(() => this.setState({ toast: '' }), 2400); }
  go(view, extra) {
    const proId = (extra && extra.proId) || this.state.proId;
    this.setState({ view, menu: false, ...(extra || {}) });
    this.props.navigate(pathFor(view, proId, (extra && extra.bookingId) || this.state.bookingId));
  }
  scrollTo(id) {
    const run = () => { const el = document.getElementById(id); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 84, behavior: 'smooth' }); };
    if (this.state.view !== 'home') { this.go('home'); setTimeout(run, 300); } else { this.setState({ menu: false }); run(); }
  }
  setCat(c, scroll) { this.setState({ cat: c, qApplied: '' }); this.flash(); if (scroll) this.scrollTo('mth-browse'); }
  openPro(id) { this.go('pro', { proId: id, proDay: null }); }
  icon(k) { return MTH.I[k] || ''; }
  card(p) {
    const M = MTH, L = MTHL, c = M.CATS[p.cat], km = L.km(p, this.at());
    // Today's availability is worked out against the clock, so a slot that has passed no longer counts.
    const next = L.nextToday(p), now = L.availableNow(p), today = now || !!next;
    return { id: p.id, img: p.img, hasImg: !!p.img, noImg: !p.img, initials: p.initials, name: p.name, rating: p.rating.toFixed(1), reviews: p.reviews,
      roleLine: c.one + ' · ' + p.qual, exp: p.exp, langs: p.langs.join(', '), distLine: km.toFixed(1) + ' km away · ' + p.locality, distShort: km.toFixed(1) + ' km · ' + p.locality,
      availText: p.today === '24×7' ? 'Available now · 24×7' : now ? 'Available now · ' + next : next ? 'Available today · ' + next : (() => { const fo = L.firstOpen(p); return 'Next: ' + L.fdl(fo.d) + ', ' + fo.t; })(),
      // Short form for the chip on the card photo.
      availShort: p.today === '24×7' ? 'Open 24×7' : now ? 'Available now' : next ? 'Today ' + next : (() => { const fo = L.firstOpen(p); return L.DOW[fo.d.getDay()] + ' ' + fo.t; })(),
      // The line under the price on the phone booking bar.
      nextSlot: p.today === '24×7' ? 'Available 24×7' : now ? 'Available now' : next ? 'Next slot: Today, ' + next : (() => { const fo = L.firstOpen(p); return 'Next slot: ' + L.fdl(fo.d) + ', ' + fo.t; })(),
      hasOnline: p.svcs.some(x => x.o),
      availBg: today ? '#E8F5EF' : '#F1F2F6', availFg: today ? '#1F9D6B' : '#6B7085',
      priceText: L.inr(p.price), unitText: '/ ' + c.unit,
      open: () => this.openPro(p.id), book: (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.startBook(p.id); } };
  }
  filtered() {
    const s = this.state, M = MTH, L = MTHL; const f = s.f;
    let list = M.pros.filter(p => s.cat === 'all' || p.cat === s.cat);
    // The search box above the list: a name, category, qualification or service.
    const words = s.find.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length) list = list.filter(p => { const c = M.CATS[p.cat]; const text = [p.name, p.qual, c.label, c.one, c.plural, c.brand, ...p.svcs.map(x => x.n)].join(' ').toLowerCase(); return words.every(w => text.includes(w)); });
    if (s.qApplied) { const q = s.qApplied.toLowerCase(); list = list.filter(p => (p.name + ' ' + p.qual + ' ' + M.CATS[p.cat].label + ' ' + p.svcs.map(x => x.n).join(' ')).toLowerCase().includes(q) || q.split(' ').some(w => w.length > 3 && M.CATS[p.cat].label.toLowerCase().includes(w.slice(0, 5)))); }
    list = list.filter(p => p.price <= f.price || f.price >= 1600).filter(p => f.gender === 'Any' || (f.gender === 'Female' ? p.g === 'F' : p.g === 'M'))
      .filter(p => f.langs.every(l => p.langs.includes(l))).filter(p => p.exp >= f.exp).filter(p => p.rating >= f.rating)
      .filter(p => !f.dist || L.km(p, this.at()) <= f.dist).filter(p => !s.availNow || L.availableNow(p)).filter(p => !s.onlineOnly || p.svcs.some(x => x.o));
    // Nearest first by default; ratings break ties, and distance breaks ties between equal ratings.
    const at = this.at(), k = new Map(list.map(p => [p.id, L.km(p, at)]));
    const byR = (a, b) => b.rating - a.rating || b.reviews - a.reviews || k.get(a.id) - k.get(b.id); const byK = (a, b) => k.get(a.id) - k.get(b.id) || b.rating - a.rating;
    return list.sort(s.sort === 'near' ? byK : byR);
  }
  filterCount() { const f = this.state.f; return (f.price < 1600) + (f.gender !== 'Any') + (f.langs.length > 0) + (f.exp > 0) + (f.rating > 0) + (f.dist > 0); }
  setF(k, v) { this.setState(s => ({ f: { ...s.f, [k]: v } })); this.flash(); }
  doSearch() {
    const s = this.state, M = MTH; const q = s.q.trim(); let cat = s.cat, qa = '';
    if (q) { const sg = M.SUG.find(x => x[0].toLowerCase() === q.toLowerCase()); const cm = M.ORDER.find(k => M.CATS[k].label.toLowerCase().startsWith(q.toLowerCase().slice(0, 5)) || q.toLowerCase().includes(M.CATS[k].brand.toLowerCase()));
      if (sg) cat = sg[1]; else if (cm) cat = cm; else { cat = 'all'; qa = q; } }
    this.setState({ cat, qApplied: qa, qOpen: false, locOpen: false, whenOpen: false }); this.flash(); this.scrollTo('mth-browse');
  }

  homeVals() {
    const s = this.state, M = MTH, L = MTHL; const mob = s.w < 860;
    const ql = s.q.toLowerCase();
    const sugs = M.SUG.filter(x => !ql || x[0].toLowerCase().includes(ql)).slice(0, 6).map(x => ({ label: x[0], sub: M.CATS[x[1]].brand + ' To Home', icon: this.icon(x[1]), pick: () => { this.setState({ q: x[0], qOpen: false }); } }));
    const locGroup = (dist) => Object.keys(M.LOCS).filter(k => M.LOCS[k][2] === dist).map(k => ({ name: k, fg: k === s.loc ? '#fff' : '#02084D', bg: k === s.loc ? '#02084D' : '#fff', bd: k === s.loc ? '#02084D' : '#E6E8EF', pick: () => { this.pickLoc(k); this.flash(); } }));
    const days = Array.from({ length: 10 }, (_, i) => { const d = L.add(L.T0, i); const sel = s.whenDate === L.K(d); return { dow: i === 0 ? 'Today' : L.DOW[d.getDay()], n: d.getDate(), mon: L.MON[d.getMonth()], bg: sel ? '#02084D' : '#fff', fg: sel ? '#fff' : '#02084D', bd: sel ? '#02084D' : '#E6E8EF', pick: () => this.setState({ when: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : L.fd(d), whenDate: L.K(d), whenOpen: false }) }; });
    const whenOpts = ['Today', 'Tomorrow'].map((w, i) => ({ label: w, bg: s.when === w ? '#02084D' : '#fff', fg: s.when === w ? '#fff' : '#02084D', bd: s.when === w ? '#02084D' : '#E6E8EF', pick: () => this.setState({ when: w, whenDate: L.K(L.add(L.T0, i)), whenOpen: false }) }));
    const tabs = ['all', ...M.ORDER].map(k => { const on = s.cat === k; return { label: k === 'all' ? 'All' : M.CATS[k].label, icon: this.icon(k), bg: on ? '#02084D' : '#fff', fg: on ? '#fff' : '#02084D', bd: on ? '#02084D' : '#E6E8EF', stroke: on ? '#fff' : '#02084D', pick: () => this.setCat(k) }; });
    const all = this.filtered();
    const plural = s.cat === 'all' ? 'professionals' : M.CATS[s.cat].plural;
    const chip = (on) => ({ bg: on ? '#02084D' : '#fff', fg: on ? '#fff' : '#02084D', bd: on ? '#02084D' : '#E6E8EF' });
    const fc = this.filterCount(); const f = s.f;
    const seg = (key, opts, fmt) => opts.map(o => ({ label: fmt ? fmt(o) : o, ...chip(f[key] === o), pick: () => this.setF(key, o) }));
    const LANGS = ['Malayalam', 'English', 'Hindi', 'Tamil', 'Arabic'];
    const th = M.THER.find(t => t.id === s.therapy) || M.THER[0];
    return {
      mob, desk: !mob, sugs, qOpen: s.qOpen && sugs.length > 0, q: s.q,
      onQ: (e) => this.setState({ q: e.target.value, qOpen: true }), onQFocus: () => this.setState({ qOpen: true, locOpen: false, whenOpen: false }),
      onQKey: (e) => { if (e.key === 'Enter') this.doSearch(); }, clearQ: () => this.setState({ q: '', qApplied: '' }), hasQ: !!s.q,
      loc: s.loc, locDistrict: (M.LOCS[s.loc] || [])[2] || 'Kozhikode', locText: s.here ? s.here.label : `${s.loc}, ${(M.LOCS[s.loc] || [])[2] || 'Kozhikode'}`,
      here: s.here, outside: s.outside, accuracyText: (h) => h.accuracy > 1000 ? 'Approximate location' : `Accurate to about ${h.accuracy} m`,
      nearby: (s.nearby || []).map(n => ({ ...n, on: n.name === s.loc && !s.here, kmText: n.km < 10 ? n.km.toFixed(1) + ' km' : Math.round(n.km) + ' km', pick: () => { this.pickLoc(n.name); this.flash(); } })), locLoading: s.locLoading, locReady: !s.locLoading, locOpen: s.locOpen,
      toggleLoc: () => this.setState(x => ({ locOpen: !x.locOpen, qOpen: false, whenOpen: false })), useMyLoc: () => this.detect(),
      kozLocs: locGroup('Kozhikode'), mlpLocs: locGroup('Malappuram'),
      when: s.when, whenOpen: s.whenOpen, toggleWhen: () => this.setState(x => ({ whenOpen: !x.whenOpen, qOpen: false, locOpen: false })), whenOpts, days,
      doSearch: () => this.doSearch(),
      tabs, grid: all.slice(0, s.gridLimit).map(p => this.card(p)), gridHasMore: !s.gridLoading && all.length > s.gridLimit, moreLabel: 'Show more (' + (all.length - s.gridLimit) + ' more)', showMore: () => this.setState(x => ({ gridLimit: x.gridLimit + GRID_PAGE })), gridEmpty: !s.gridLoading && all.length === 0, gridHas: !s.gridLoading && all.length > 0,
      loading: s.gridLoading, notLoading: !s.gridLoading, skel: [1, 2, 3, 4, 5, 6, 7, 8], skel4: [1, 2, 3, 4],
      catTitle: s.cat === 'all' ? 'professionals' : M.CATS[s.cat].plural,
      countText: all.length + ' ' + (all.length === 1 && s.cat !== 'all' ? M.CATS[s.cat].one.toLowerCase() : plural) + ' near ' + (s.here ? s.here.label : s.loc),
      find: s.find, hasFind: !!s.find, onFind: (e) => this.setState({ find: e.target.value }), clearFind: () => this.setState({ find: '' }),
      qAppliedText: s.qApplied ? 'Results for “' + s.qApplied + '”' : '', hasQApplied: !!s.qApplied,
      emptyText: s.find.trim() ? 'No ' + plural + ' match “' + s.find.trim() + '”. Check the spelling, or try a category or service.' : 'No ' + plural + ' available at this time — try another date or nearby area.',
      resetFilters: () => { this.setState({ f: { price: 1600, gender: 'Any', langs: [], exp: 0, rating: 0, dist: 0 }, availNow: false, onlineOnly: false }); this.flash(); },
      resetAll: () => { this.setState({ f: { price: 1600, gender: 'Any', langs: [], exp: 0, rating: 0, dist: 0 }, availNow: false, onlineOnly: false, qApplied: '', cat: 'all', find: '' }); this.flash(); },
      sortTop: chip(s.sort === 'top'), sortNear: chip(s.sort === 'near'), availChip: chip(s.availNow), onlineChip: chip(s.onlineOnly),
      setTop: () => { this.setState({ sort: 'top' }); this.flash(); }, setNear: () => { this.setState({ sort: 'near' }); this.flash(); }, togAvail: () => { this.setState(x => ({ availNow: !x.availNow })); this.flash(); }, togOnline: () => { this.setState(x => ({ onlineOnly: !x.onlineOnly })); this.flash(); },
      filtersOpen: s.filtersOpen, openFilters: () => this.setState({ filtersOpen: true }), closeFilters: () => this.setState({ filtersOpen: false }),
      fc, hasFc: fc > 0, fPrice: f.price, fPriceText: f.price >= 1600 ? 'Any price' : 'Up to ' + L.inr(f.price), onPrice: (e) => this.setF('price', +e.target.value),
      fGender: seg('gender', ['Any', 'Female', 'Male']), fExp: seg('exp', [0, 3, 5, 10], o => o ? o + '+ yrs' : 'Any'), fRating: seg('rating', [0, 4.5, 4.8], o => o ? '★ ' + o + '+' : 'Any'),
      fDist: seg('dist', [0, 5, 10, 25], o => o ? 'Within ' + o + ' km' : 'Any'),
      fLangs: LANGS.map(l => ({ label: l, ...chip(f.langs.includes(l)), pick: () => this.setF('langs', f.langs.includes(l) ? f.langs.filter(x => x !== l) : [...f.langs, l]) })),
      showN: 'Show ' + all.length + ' results',
      services: this.services(), therapies: M.THER.map(t => ({ label: t.label, ...chip(t.id === s.therapy), pick: () => this.setState({ therapy: t.id }) })),
      th, thSteps: th.steps.map((x, i) => ({ n: '0' + (i + 1), t: x })), thFocus: th.id, thCta: 'Book a ' + th.brand + ' To Home plan', thBrand: th.brand,
      thBook: () => { const p = M.pros.filter(p => p.cat === th.cat).sort((a, b) => b.rating - a.rating)[0]; const si = { knee: 1, back: 0, stroke: 2, shoulder: 5, speech: 1, ot: 1 }[th.id] || 0; this.startBook(p.id, { svc: Math.min(si, p.svcs.length - 1), plan: true }); },
      thMore: () => this.setCat(th.cat, true),
    };
  }
  services() {
    const L = MTHL; const go = (k) => () => this.setCat(k, true);
    const G = [['Doctor', 'doctor', [['General check-up', 550], ['Fever & infection', 550], ['BP & diabetes review', 550], ['Elderly check-up', 650], ['Palliative care visit', 820]]],
      ['Dental', 'dentist', [['Dental check-up', 550], ['Toothache relief', 660], ['Scaling & cleaning', 830], ['Denture fitting & repair', 880], ['Oral care for bedridden patients', 720]]],
      ['Nurse', 'nurse', [['Injection', 230], ['IV drip', 630], ['Wound dressing', 450], ['Catheter & Ryles tube care', 540], ['12/24-hr nursing', 1800]]],
      ['Physio', 'physio', [['Back & neck pain', 550], ['Knee & joint pain', 550], ['Stroke rehab', 660], ['Post-surgery rehab', 600], ['Sports injury', 600]]],
      ['Therapy', 'speech', [['Occupational therapy', 650], ['Speech therapy', 550], ['Swallowing (dysphagia)', 630], ['Child development', 720]]],
      ['Mind', 'psych', [['Counselling', 800], ['Clinical psychology', 1000], ['Elderly & caregiver support', 800]]],
      ['Diet', 'diet', [['Diabetic diet', 500], ['Kidney diet', 600], ['Weight management', 500], ['Child nutrition', 450]]],
      ['Lab', 'lab', [['Blood tests', 220], ['Health packages', 1120], ['Urine tests', 150], ['ECG at home', 370]]],
      ['Pharmacy', 'pharma', [['Medicine delivery', 70], ['Medicine review', 150]]],
      ['Care', 'caregiver', [['Elderly caregiver', 1200], ['Patient attendant', 1140], ['Home health aide', 850], ['Baby & postnatal care', 1300]]],
      ['Ambulance', 'ambulance', [['Emergency ambulance', 1500], ['Patient transfer', 1200], ['Paramedic support', 1200]]]];
    return G.map(([b, k, items]) => ({ brand: b, icon: this.icon(k === 'psych' ? 'mind' : k), items: items.map(([n, p]) => ({ n, p: 'from ' + L.inr(p) })), go: go(k) }));
  }

  setB(patch) { this.setState(s => ({ b: { ...s.b, ...patch, err: '' } })); }
  startBook(id, o) {
    o = o || {}; const M = MTH, L = MTHL; const p = M.pros.find(x => x.id === id); const c = M.CATS[p.cat]; const fo = L.firstOpen(p);
    const online = !!(p.svcs[o.svc || 0] || {}).o;
    const plan = online ? false : o.plan != null ? (c.allowPlan && o.plan) : c.plan; const d = o.date || L.K(fo.d);
    const lc = M.LOCS[this.state.loc] || M.LOCS['Nadakkavu'];
    const saved = this.state.addresses[0]; const self = this.state.patients.find(x => x.rel === 'Me');
    const b = { step: 0, svc: o.svc || 0, plan, ...this.addrFields(saved), pin: saved ? this.addrFields(saved).pin : lc[3],
      date: d, slot: o.slot || fo.t, sessions: 10, customN: '12', start: d, freq: c.mode === 'care' ? 'daily' : 'alt', days: [0, 1, 2, 3, 4, 5], skip: [], hours: 12, ndays: 7,
      who: 'self', fam: '', patientId: self ? self.id : undefined, pname: self ? self.name : '', age: self ? self.age : '', gender: self ? self.gender : '', notes: '', files: [], share: true, pay: 'later', listOpen: false, calOff: 0, err: '' };
    this.go('book', { proId: id, b });
  }
  proVals() {
    const s = this.state, M = MTH, L = MTHL; const p = M.pros.find(x => x.id === s.proId) || M.pros[0]; const c = M.CATS[p.cat];
    const days = Array.from({ length: 7 }, (_, i) => L.add(L.T0, i));
    let di = s.proDay == null ? days.findIndex(d => !L.offDay(p, d)) : s.proDay; if (di < 0) di = 0;
    const dsel = days[di];
    const week = days.map((d, i) => { const off = L.offDay(p, d); const on = i === di; const free = off ? 0 : L.ALL.filter(t => !L.booked(p, d, t)).length;
      return { dow: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : L.DOW[d.getDay()], n: d.getDate(), sub: off ? 'Off' : free + ' slots', bg: on ? '#02084D' : '#fff', fg: on ? '#fff' : off ? '#B5B8C6' : '#02084D', bd: on ? '#02084D' : '#E6E8EF', pick: () => this.setState({ proDay: i }) }; });
    const offSel = L.offDay(p, dsel);
    const pslots = offSel ? [] : L.shownTimes(p, dsel).map(t => { const bk = L.booked(p, dsel, t); return { t, label: bk ? 'Booked' : t, bg: bk ? '#F6F7FA' : '#fff', fg: bk ? '#B5B8C6' : '#02084D', bd: bk ? '#F0F1F5' : '#E6E8EF', cur: bk ? 'default' : 'pointer', pick: () => { if (!bk) this.startBook(p.id, { date: L.K(dsel), slot: t, plan: false }); } }; });
    const km = L.km(p, this.at());
    const similar = M.pros.filter(x => x.cat === p.cat && x.id !== p.id).sort((a, b) => L.km(a, this.at()) - L.km(b, this.at())).slice(0, 4).map(x => this.card(x));
    return {
      pp: { ...this.card(p), qual: p.qual, reg: p.reg, bio: p.bio, role: c.one, brand: c.brand, locality: p.locality, district: M.LOCS[p.locality][2], radius: p.radius, towns: (p.towns || []).join(', '), km: km.toFixed(1), langsList: p.langs, roleQual: c.one + ' · ' + p.qual },
      ppSvcs: p.svcs.map((x, i) => ({ n: x.n, d: x.d, price: L.inr(x.p), unit: '/ ' + (x.o ? 'consultation' : c.unit), online: !!x.o, book: () => this.startBook(p.id, { svc: i }) })),
      ppRevs: p.revs.map(r => ({ ...r, starsTxt: '★★★★★'.slice(0, r.stars) + '☆☆☆☆☆'.slice(0, 5 - r.stars), initial: r.name[0] })),
      week, pslots, hasSlots: pslots.length > 0, noSlots: pslots.length === 0, selDayText: L.fdl(dsel),
      similar, hasSimilar: similar.length > 0, ppBook: () => this.startBook(p.id), ppPlanBook: () => this.startBook(p.id, { plan: true }), ppCanPlan: c.allowPlan,
      ppBack: () => this.go('home'), ppShare: () => this.toast('Profile link copied'), ppSave: () => this.toast('Saved to your favourites'),
      ppChat: () => this.toast('Chat opens after booking'),
    };
  }
  bookVals() {
    const s = this.state; const out = this.proVals(); if (!s.b) return out;
    const M = MTH, L = MTHL; const b = s.b; const p = M.pros.find(x => x.id === s.proId); const c = M.CATS[p.cat]; const mode = c.mode;
    const N = '#02084D', chip = (on) => ({ bg: on ? N : '#fff', fg: on ? '#fff' : N, bd: on ? N : '#E6E8EF' });
    // An online consultation needs no address: the Location step is skipped.
    const online = !!(p.svcs[b.svc] || p.svcs[0]).o;
    const STEPS = ['Service', online ? 'Video call' : 'Location', 'Schedule', 'Patient', 'Review & pay'];
    const steps = STEPS.map((t, i) => ({ t, n: i < b.step ? '✓' : String(i + 1), dotBg: i <= b.step ? N : '#fff', dotFg: i <= b.step ? '#fff' : '#9A9EB3', dotBd: i <= b.step ? N : '#E6E8EF', fg: i === b.step ? N : i < b.step ? '#4A4F6A' : '#9A9EB3', w: i === b.step ? 500 : 400, bar: i < b.step ? N : '#E6E8EF', last: i === 4, notLast: i !== 4, flex: i === 4 ? 'none' : '1 1 auto', lblDisp: s.w < 860 && i !== b.step ? 'none' : 'inline', go: () => { if (i < b.step) this.setB({ step: online && i === 1 ? 0 : i }); } }));
    const svcs = p.svcs.map((x, i) => ({ n: x.n, d: x.d, price: L.inr(x.p), ...chip(false), sel: i === b.svc, rbd: i === b.svc ? N : '#E6E8EF', rbg: i === b.svc ? '#F6F7FA' : '#fff', dot: i === b.svc ? N : '#fff', dotBd: i === b.svc ? N : '#C9CCD8', online: !!x.o, pick: () => this.setB(x.o ? { svc: i, plan: false } : { svc: i }) }));
    const sess = L.sessions(b, mode); const keys = new Set(sess.map(L.K));
    const base = b.plan ? L.P(b.start) : L.P(b.date); const mb = new Date(base.getFullYear(), base.getMonth() + b.calOff, 1); const mo = L.month(mb);
    const t0 = L.K(L.T0);
    const cells = mo.cells.map(d => {
      if (!d) return { n: '', bg: 'transparent', fg: 'transparent', bd: 'transparent', deco: 'none', cur: 'default', click: () => {} };
      const k = L.K(d), past = d < L.T0 && k !== t0;
      if (!b.plan) { const off = L.offDay(p, d), sel = k === b.date; return { n: d.getDate(), bg: sel ? N : 'transparent', fg: sel ? '#fff' : off ? '#C3C6D2' : N, bd: k === t0 && !sel ? '#C9CCD8' : 'transparent', deco: off && !past ? 'line-through' : 'none', cur: off ? 'default' : 'pointer',
        click: () => { if (!off) { const ok = !L.booked(p, d, b.slot); this.setB({ date: k, slot: ok ? b.slot : (L.ALL.find(t => !L.booked(p, d, t)) || b.slot) }); } } }; }
      const isS = keys.has(k), isK = b.skip.includes(k);
      return { n: d.getDate(), bg: isS ? N : isK ? '#F1F2F6' : 'transparent', fg: isS ? '#fff' : isK ? '#9A9EB3' : past ? '#C3C6D2' : N, bd: k === t0 && !isS ? '#C9CCD8' : 'transparent', deco: isK ? 'line-through' : 'none', cur: isS || isK ? 'pointer' : 'default',
        click: () => { if (isS) this.setB({ skip: [...b.skip, k] }); else if (isK) this.setB({ skip: b.skip.filter(x => x !== k) }); } };
    });
    const canPrev = b.calOff > 0 || mb > new Date(L.T0.getFullYear(), L.T0.getMonth(), 1);
    const slotRef = b.plan ? L.P(b.start) : L.P(b.date);
    // A single visit lists only the hours this professional works that day; a plan's dates vary, so it lists every hour.
    const shown = b.plan ? L.ALL : L.shownTimes(p, slotRef);
    const slotGroups = L.SL.map(([g, ts]) => ({ g, slots: ts.filter(t => shown.includes(t)).map(t => { const bk = !b.plan && L.booked(p, slotRef, t); const on = b.slot === t; return { t: bk ? 'Booked' : t, bg: on ? N : bk ? '#F6F7FA' : '#fff', fg: on ? '#fff' : bk ? '#B5B8C6' : N, bd: on ? N : bk ? '#F0F1F5' : '#E6E8EF', cur: bk ? 'not-allowed' : 'pointer', pick: () => { if (!bk) this.setB({ slot: t }); } }; }) })).filter(g => g.slots.length);
    const startDays = Array.from({ length: 14 }, (_, i) => { const d = L.add(L.T0, i); const on = L.K(d) === b.start; return { dow: i === 0 ? 'Today' : L.DOW[d.getDay()], n: d.getDate(), mon: L.MON[d.getMonth()], ...chip(on), pick: () => this.setB({ start: L.K(d), skip: [], calOff: 0 }) }; });
    const sessOpts = [5, 10, 15, 20, 'custom'].map(n => ({ label: n === 'custom' ? 'Custom' : String(n), ...chip(b.sessions === n), pick: () => this.setB({ sessions: n, skip: [] }) }));
    const freqOpts = Object.keys(L.FREQ).map(k => ({ label: L.FREQ[k], ...chip(b.freq === k), pick: () => this.setB({ freq: k, skip: [] }) }));
    const dayOpts = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => ({ l, ...chip(b.days.includes(i)), pick: () => { const nd = b.days.includes(i) ? b.days.filter(x => x !== i) : [...b.days, i]; if (nd.length) this.setB({ days: nd, skip: [] }); } }));
    const hourOpts = [4, 8, 12, 24].map(h => ({ label: h + ' hrs', ...chip(b.hours === h), pick: () => this.setB({ hours: h }) }));
    const ndayOpts = [3, 7, 14, 30].map(n => ({ label: n + ' days', ...chip(b.ndays === n), pick: () => this.setB({ ndays: n, skip: [] }) }));
    const first = sess[0], last = sess[sess.length - 1];
    const summary = !b.plan ? L.fdl(first) + ' · ' + b.slot : mode === 'care' ? sess.length + ' days · ' + b.hours + ' hrs/day · from ' + b.slot + ' · ' + L.fd(first) + ' – ' + L.fd(last)
      : sess.length + ' sessions · ' + (b.freq === 'custom' ? b.days.map(i => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]).join(', ') : L.FREQ[b.freq]) + ' · ' + b.slot + ' · ' + L.fd(first) + ' – ' + L.fd(last);
    const pr = L.price(p, b, mode);
    const rows = [[L.inr(pr.unit) + ' × ' + pr.n + ' ' + (pr.n === 1 ? pr.unitLabel : (mode === 'care' && b.plan ? 'days' : c.unit + 's')), L.inr(pr.sub)]];
    if (pr.disc) rows.push(['Package discount (' + Math.round(pr.rate * 100) + '% off)', '− ' + L.inr(pr.disc)]);
    rows.push(['Platform fee', L.inr(pr.fee)], ['GST (18% on platform fee)', L.inr(pr.gst)]);
    const addrOpts = [...s.addresses.map(a => ({ l: a.label + ' · ' + (a.house || a.locality), ...chip(b.addr === a.id), pick: () => this.setB(this.addrFields(a)) })),
      { l: '+ New address', ...chip(b.addr === 'new'), pick: () => this.setB({ addr: 'new', addressId: undefined, house: '', street: '', landmark: '', locality: s.loc, pin: (M.LOCS[s.loc] || [])[3] || '' }) }];
    const fld = (k) => (e) => this.setB({ [k]: e.target.value });
    const famList = s.patients.filter(x => x.rel !== 'Me'); const self = s.patients.find(x => x.rel === 'Me');
    const whoOpts = [['self', 'Myself'], ['fam', 'Family member']].map(([k, l]) => ({ l, ...chip(b.who === k), pick: () => { const f = famList[0]; this.setB(k === 'self' ? { who: k, fam: '', patientId: self && self.id, pname: self ? self.name : '', age: self ? self.age : '', gender: self ? self.gender : '' } : { who: k, fam: f ? f.id : 'new', patientId: f && f.id, pname: f ? f.name : '', age: f ? f.age : '', gender: f ? f.gender : '' }); } }));
    const famOpts = famList.map(f => ({ l: f.rel, sub: f.name, ...chip(b.fam === f.id), pick: () => this.setB({ fam: f.id, patientId: f.id, pname: f.name, age: f.age, gender: f.gender }) }));
    const addFam = () => this.setB({ fam: 'new', patientId: undefined, pname: '', age: '', gender: '' });
    const genderOpts = ['Female', 'Male', 'Other'].map(g => ({ l: g, ...chip(b.gender === g), pick: () => this.setB({ gender: g }) }));
    const PAY = [['later', online ? 'Pay after the consultation' : 'Pay after first visit', online ? 'UPI to the professional. Online payment is coming soon.' : 'Cash or UPI to the professional. Online payment is coming soon.']];
    const payOpts = PAY.map(([k, l, sub]) => ({ l, sub, rbd: b.pay === k ? N : '#E6E8EF', rbg: b.pay === k ? '#F6F7FA' : '#fff', dot: b.pay === k ? N : '#fff', dotBd: b.pay === k ? N : '#C9CCD8', pick: () => this.setB({ pay: k }) }));
    const schedAll = sess.map((d, i) => ({ n: String(i + 1).padStart(2, '0'), d: L.fdl(d), t: b.slot }));
    const sched = b.listOpen ? schedAll : schedAll.slice(0, 4);
    const next = () => { if (b.step === 3 && !b.pname.trim()) { this.setState(x => ({ b: { ...x.b, err: 'Please enter the patient’s name.' } })); return; } if (b.step === 1 && !/^\d{6}$/.test(String(b.pin || '').trim())) { this.setState(x => ({ b: { ...x.b, err: 'Please enter a 6-digit pincode.' } })); return; } if (b.step === 1 && !b.house.trim()) { this.setState(x => ({ b: { ...x.b, err: 'Please enter your house or flat name.' } })); return; } if (b.step === 4) { this.confirm(); return; } this.setB({ step: online && b.step === 0 ? 2 : b.step + 1 }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const STAT = ['Accepted', 'On the way', 'Arrived', 'In session', 'Completed'];
    return { ...out,
      b, steps, st0: b.step === 0, st1: b.step === 1, st2: b.step === 2, st3: b.step === 3, st4: b.step === 4, stepTitle: STEPS[b.step], stepNo: 'Step ' + (b.step + 1) + ' of 5',
      bkPro: this.card(p), bkRole: c.one, bkBrand: c.brand, svcs, canPlan: c.allowPlan && !online, bkOnline: online, bkHome: !online, single: !b.plan, plan: b.plan, care: mode === 'care', sessMode: mode !== 'care',
      planSession: b.plan && mode !== 'care', planCare: b.plan && mode === 'care',
      planSingleChip: chip(!b.plan), planMultiChip: chip(b.plan), setSingle: () => this.setB({ plan: false, calOff: 0 }), setPlan: () => this.setB({ plan: true, calOff: 0, start: b.date }),
      planNote: mode === 'care' ? 'Most families book 7 days or more — 10% off from 10 days.' : c.plan ? 'Most patients need 10–15 sessions. 10% off from 10 sessions.' : 'Plans get 10% off from 10 visits.',
      planLabel: online ? 'Video call' : b.plan ? (mode === 'care' ? 'Care plan' : 'Treatment plan') : 'Single visit', multiLabel: mode === 'care' ? 'Care plan (multiple days)' : 'Treatment plan (multiple days)',
      addrOpts, house: b.house, street: b.street, landmark: b.landmark, locality: b.locality, pin: b.pin, onHouse: fld('house'), onStreet: fld('street'), onLandmark: fld('landmark'), onLocality: fld('locality'), onPin: fld('pin'),
      locNames: Object.keys(M.LOCS), addrShort: [b.house, b.street, b.locality].filter(Boolean).join(', '), addrDistrict: (M.LOCS[b.locality] || [])[2] || '',
      calLabel: mo.label, cells, calPrev: () => { if (canPrev) this.setB({ calOff: b.calOff - 1 }); }, calNext: () => this.setB({ calOff: b.calOff + 1 }), prevOp: canPrev ? 1 : .3, wkHdr: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      slotGroups, startDays, sessOpts, isCustomN: b.sessions === 'custom', customN: b.customN, onCustomN: fld('customN'), freqOpts, isCustomDays: b.freq === 'custom', dayOpts, hourOpts, ndayOpts,
      summary, sessCount: sess.length, skipCount: b.skip.length, hasSkip: b.skip.length > 0, skipText: b.skip.length + ' skipped — moved to the end of the plan',
      svcName: pr.svc.n, svcDur: pr.svc.d, rows: rows.map(r => ({ l: r[0], v: r[1], green: r[0].startsWith('Package') ? '#1F9D6B' : '#02084D' })), total: L.inr(pr.total), saving: pr.disc ? 'You save ' + L.inr(pr.disc) : '', hasSaving: pr.disc > 0,
      whoOpts, isFam: b.who === 'fam', famOpts, addFam, genderOpts, pname: b.pname, age: b.age, notes: b.notes, onPname: fld('pname'), onAge: fld('age'), onNotes: fld('notes'),
      files: b.files.map(f => ({ f, rm: () => this.setB({ files: b.files.filter(x => x !== f) }) })), hasFiles: b.files.length > 0, addFile: () => this.setB({ files: [...b.files, ['Discharge_summary_Oct.pdf', 'Xray_knee_right.jpg', 'Blood_report.pdf'][b.files.length % 3]] }),
      share: b.share, shareBg: b.share ? N : '#D9DCE6', shareX: b.share ? '20px' : '2px', togShare: () => this.setB({ share: !b.share }),
      payOpts, payCard: b.pay === 'card', payLater: b.pay === 'later', sched, hasMoreSched: schedAll.length > 4, schedToggle: b.listOpen ? 'Show less' : 'Show all ' + schedAll.length + ' dates', togSched: () => this.setB({ listOpen: !b.listOpen }),
      err: b.err, hasErr: !!b.err, next, nextDisabled: s.booking, back: () => { if (b.step === 0) this.go('pro'); else this.setB({ step: online && b.step === 2 ? 0 : b.step - 1 }); }, nextLabel: b.step === 4 ? (s.booking ? 'Booking…' : 'Confirm booking') : 'Continue', backLabel: b.step === 0 ? 'Back to profile' : 'Back',
      bookingId: s.bookingId,
      ...this.liveVals(STAT, N, L), trackFallback: STAT.map((t, i) => ({ t, dotBg: i <= s.track ? N : '#fff', dotBd: i <= s.track ? N : '#D9DCE6', fg: i <= s.track ? N : '#9A9EB3', w: i === s.track ? 500 : 300, bar: i < s.track ? N : '#E6E8EF', notLast: i < 4, sub: i === s.track ? (i === 0 ? 'Just now' : i === 1 ? 'ETA ' + s.eta + ' min' : i === 2 ? 'At your door' : i === 3 ? 'Started ' + b.slot : 'Notes added to records') : '' })),
       canAdvance: false, advance: () => {},
      addCal: () => {}, shareFam: () => { const url = window.location.href; if (navigator.share) navigator.share({ title: 'My Medico To Home booking', url }).catch(() => {}); else navigator.clipboard.writeText(url).then(() => this.toast('Booking link copied')); }, chatPro: () => this.toast('Chat arrives in a later update'),
      payLabel: (PAY.find(x => x[0] === b.pay) || [])[1],
    };
  }
  acctVals() {
    const s = this.state; const A = s.acct; if (!A) return {}; const N = '#02084D'; const chip = (on) => ({ bg: on ? N : '#fff', fg: on ? '#fff' : N, bd: on ? N : '#E6E8EF' });
    const set = (fn) => this.setState(x => { const a = JSON.parse(JSON.stringify(x.acct)); fn(a); return { acct: a }; });
    const m = A.members[A.member]; const mm = (fn) => { set(a => fn(a.members[a.member])); this.savePatient(A.member); };
    const D = A.d; const dset = (k) => (e) => { const v = e.target.value; set(a => { a.d[k] = v; }); };
    const bmi = (+m.h && +m.w) ? (m.w / Math.pow(m.h / 100, 2)).toFixed(1) : '—';
    const tabs = [['records', 'Medical records'], ['consults', 'Consultations'], ['bookings', 'Bookings'], ['details', 'Personal details'], ['addresses', 'Addresses']].map(([k, l]) => ({ l, ...chip(A.tab === k), pick: () => set(a => { a.tab = k; }) }));
    const members = Object.keys(A.members).map(k => { const x = A.members[k]; return { l: x.rel === 'Me' ? 'Me' : (x.name || x.rel).split(' ')[0], sub: x.rel === 'Me' ? x.name : x.rel, init: ((x.name || x.rel)[0] || '?').toUpperCase(), on: A.member === k, ...chip(A.member === k), pick: () => set(a => { a.member = k; a.edit = false; }) }; });
    const fld = (k) => (e) => { const v = e.target.value; mm(x => { x[k] = v; }); };
    const ifld = (k) => (e) => { const v = e.target.value; set(a => { a.info[k] = v; }); };
    const upcoming = s.b && s.view !== 'book' && this._booked ? [] : [];
    const L = MTHL;
    return {
      acTabs: tabs, acRecords: A.tab === 'records', acConsults: A.tab === 'consults', acBookings: A.tab === 'bookings', acDetails: A.tab === 'details', acAddr: A.tab === 'addresses',
      acMembers: members, acM: m, acIsMe: m.rel === 'Me', acEdit: A.edit, acView: !A.edit, acBmi: bmi, acEditBtn: A.edit ? 'Done' : 'Edit',
      acTogEdit: () => { set(a => { a.edit = !a.edit; }); if (A.edit) { this.savePatient(A.member); this.toast('Health profile saved'); } },
      acOnAge: fld('age'), acOnBlood: fld('blood'), acOnH: fld('h'), acOnW: fld('w'), acOnName: fld('name'),
      acBloods: ['A+', 'A−', 'B+', 'B−', 'O+', 'O−', 'AB+', 'AB−'],
      acConds: m.conds.map((c, i) => ({ ...c, rm: () => mm(x => { x.conds.splice(i, 1); }) })), acNoConds: m.conds.length === 0,
      acAlg: m.alg.map((a, i) => ({ a, rm: () => mm(x => { x.alg.splice(i, 1); }) })), acNoAlg: m.alg.length === 0,
      acMeds: m.meds.map((c, i) => ({ ...c, rm: () => mm(x => { x.meds.splice(i, 1); }) })), acNoMeds: m.meds.length === 0,
      acHist: m.hist.map((c, i) => ({ ...c, rm: () => mm(x => { x.hist.splice(i, 1); }) })), acNoHist: m.hist.length === 0,
      acReps: m.reps.map((c, i) => ({ ...c, date: new Date(c.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), size: c.size > 1048576 ? (c.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(c.size / 1024)) + ' KB',
        rm: () => api(`/documents/${c.id}`, { method: 'DELETE' }).then(() => set(a => { a.members[a.member].reps.splice(i, 1); })).catch(e => this.toast(e.message)),
        view: () => api(`/documents/${c.id}/url`).then(r => window.open(r.url, '_blank', 'noopener')).catch(e => this.toast(e.message)) })), acNoReps: m.reps.length === 0,
      dCond: D.cond, dSince: D.since, dAlg: D.alg, dMedN: D.medN, dMedD: D.medD, dMedF: D.medF, dHT: D.hT, dHN: D.hN,
      onDCond: dset('cond'), onDSince: dset('since'), onDAlg: dset('alg'), onDMedN: dset('medN'), onDMedD: dset('medD'), onDMedF: dset('medF'), onDHT: dset('hT'), onDHN: dset('hN'),
      acFreqs: ['Once daily', 'Twice daily', 'Three times daily', 'At night', 'As needed'],
      addCond: () => { if (!D.cond.trim()) return; set(a => { a.members[a.member].conds.push({ n: a.d.cond.trim(), since: a.d.since.trim() || String(new Date().getFullYear()) }); a.d.cond = ''; a.d.since = ''; }); this.savePatient(A.member); },
      addAlg: () => { if (!D.alg.trim()) return; set(a => { a.members[a.member].alg.push(a.d.alg.trim()); a.d.alg = ''; }); this.savePatient(A.member); },
      onAlgKey: (e) => { if (e.key === 'Enter' && D.alg.trim()) { set(a => { a.members[a.member].alg.push(a.d.alg.trim()); a.d.alg = ''; }); this.savePatient(A.member); } },
      addMed: () => { if (!D.medN.trim()) return; set(a => { a.members[a.member].meds.push({ n: a.d.medN.trim(), dose: a.d.medD.trim() || '—', freq: a.d.medF }); a.d.medN = ''; a.d.medD = ''; }); this.savePatient(A.member); },
      addHist: () => { if (!D.hT.trim()) return; set(a => { a.members[a.member].hist.unshift({ date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), title: a.d.hT.trim(), by: 'Added by you', note: a.d.hN.trim() }); a.d.hT = ''; a.d.hN = ''; }); this.savePatient(A.member); this.toast('Added to history'); },
      addRep: () => this.uploadReport(A.member),
      acShare: m.share, acShareBg: m.share ? N : '#D9DCE6', acShareX: m.share ? '20px' : '2px', acTogShare: () => mm(x => { x.share = !x.share; }),
      // The health card on the right follows whoever is selected; the account holder's card carries their contact details too.
      acCard: (() => { const base = { id: m.id, name: m.name || '', gender: m.gender || '', blood: m.blood || '', h: m.h || '', w: m.w || '', conds: (m.conds || []).map(c => c.n), alg: m.alg || [], meds: (m.meds || []).map(x => x.n) };
        if (m.rel !== 'Me') return { ...base, relation: m.rel, age: m.age || '' };
        const home = s.addresses[0];
        return { ...base, id: s.me.id, name: A.info.name || '', email: s.me.email, phone: (A.info.phone || '').replace(/\D/g, '').slice(-10), city: s.me.city || '', dob: A.info.dob || '', language: s.me.preferred_language || '',
          emergency: A.info.emerg || '', address: home ? [home.house, home.street, home.landmark, home.locality, home.pincode].filter(Boolean).join(', ') : '' }; })(),
      acEditCard: () => { if (m.rel === 'Me') this.toSetup(); else set(a => { a.tab = 'records'; a.edit = true; }); },
      acCards: members, acHasFamily: members.length > 1,
      acAdding: !!A.adding, acStartAdd: () => set(a => { a.adding = true; }), acCancelAdd: () => { set(a => { a.adding = false; }); window.scrollTo({ top: 0 }); },
      acRemoveMember: () => {
        if (m.rel === 'Me') return; const first = (m.name || m.rel).split(' ')[0];
        if (!window.confirm(`Remove ${first} from your family?\n\nTheir health card, medical records and uploaded reports will be deleted. Past bookings stay in your history.`)) return;
        api(`/patients/${m.id}`, { method: 'DELETE' }).then(() => {
          set(a => { delete a.members[m.id]; const self = Object.keys(a.members).find(k => a.members[k].rel === 'Me'); a.member = self || Object.keys(a.members)[0]; a.edit = false; });
          this.setState(x => ({ patients: x.patients.filter(p => p.id !== m.id) })); this.toast(`${first} removed from your family`);
        }).catch(e => this.toast(e.message));
      },
      acMemberAdded: (n) => { set(a => { a.members[n.id] = { ...n, phone: '' }; a.member = n.id; a.adding = false; a.tab = 'records'; a.edit = false; }); this.setState(x => ({ patients: [...x.patients, n] })); window.scrollTo({ top: 0 }); this.toast(`Health card created for ${n.name.split(' ')[0]}`); },
      acInfo: A.info, onIName: ifld('name'), onIPhone: ifld('phone'), onIDob: ifld('dob'), onIEmerg: ifld('emerg'),
      saveInfo: () => api('/me', { method: 'PATCH', body: { full_name: A.info.name || undefined, phone: A.info.phone, dob: A.info.dob, emergency_contact: A.info.emerg } }).then(() => this.afterAuth()).then(() => this.toast('Personal details saved')).catch(e => this.toast(e.message)),
      logout: () => { supabase.auth.signOut({ scope: 'local' }); this._loginAsked = false; this.setState({ user: null, me: null, patients: [], addresses: [], bookings: [], acct: null }); this.go('home'); this.toast('Logged out'); },
      acAddresses: s.addresses.map(a => ({ label: a.label, text: [a.house, a.street, a.landmark, a.locality, a.pincode].filter(Boolean).join(', '), rm: () => api(`/addresses/${a.id}`, { method: 'DELETE' }).then(() => this.setState(x => ({ addresses: x.addresses.filter(y => y.id !== a.id) }))).catch(e => this.toast(e.message)) })), acNoAddr: s.addresses.length === 0,
      ...this.acctBookings(),
    };
  }
  mkB(p) { const L = MTHL; const fo = L.firstOpen(p); const self = this.state.patients.find(x => x.rel === 'Me'); const saved = this.state.addresses[0]; return { step: 4, svc: 0, plan: false, ...this.addrFields(saved), date: L.K(fo.d), slot: fo.t, sessions: 10, customN: '12', start: L.K(fo.d), freq: 'alt', days: [0, 1, 2, 3, 4, 5], skip: [], hours: 12, ndays: 7, who: 'self', fam: '', patientId: self ? self.id : undefined, pname: self ? self.name : '', age: self ? self.age : '', gender: self ? self.gender : '', notes: '', files: [], share: true, pay: 'later', listOpen: false, calOff: 0, err: '' }; }
  liveVals(STAT, N, L) {
    const s = this.state; const v = s.live; const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' }); const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
    const ORDER = ['accepted', 'on_the_way', 'arrived', 'in_session', 'completed'];
    const visits = v ? v.visits || [] : []; const cur = visits.find(x => !['completed', 'cancelled', 'skipped', 'no_show'].includes(x.status)) || visits[visits.length - 1];
    const idx = cur ? ORDER.indexOf(cur.status) : -1; const cancelled = v && v.status === 'cancelled';
    const sub = ['Confirmed by your professional', 'Travelling to you', 'At your door', 'Visit in progress', 'Notes added to records'];
    const out = { tracks: STAT.map((t, i) => ({ t, dotBg: i <= idx ? N : '#fff', dotBd: i <= idx ? N : '#D9DCE6', fg: i <= idx ? N : '#9A9EB3', w: i === idx ? 500 : 300, bar: i < idx ? N : '#E6E8EF', notLast: i < 4, sub: i === idx ? sub[i] : '' })),
      etaText: cancelled ? 'Cancelled' : idx < 0 ? 'Waiting' : idx === 0 ? 'Accepted' : idx === 1 ? 'On the way' : idx === 2 ? 'Arrived' : idx === 3 ? 'In session' : 'Done', trackPct: Math.max(0, idx) * 25 + '%' };
    if (!v) return out;
    const sched = visits.map((x, i) => ({ n: String(i + 1).padStart(2, '0'), d: fmtDate(x.starts_at), t: fmtTime(x.starts_at) }));
    return { ...out, liveTotal: L.inr(v.total_paise / 100), liveSvc: v.service_name, liveSummary: cur ? fmtDate(cur.starts_at) + ' · ' + fmtTime(cur.starts_at) : '', liveSched: s.b && s.b.listOpen ? sched : sched.slice(0, 4), liveCount: sched.length, liveStatus: cancelled ? 'Cancelled' : v.mode === 'online' ? 'Pay after the consultation' : 'Pay after first visit',
      liveOnline: v.mode === 'online', liveHome: v.mode !== 'online', joinCall: () => window.location.assign('/call/' + v.id) };
  }
  acctBookings() {
    const s = this.state; const L = MTHL; const fmt = (d) => new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
    const row = (b) => { const p = MTH.pros.find(x => x.id === b.professional_id); const open = (b.visits || []).find(v => !['completed', 'cancelled', 'skipped', 'no_show'].includes(v.status)); const last = (b.visits || []).filter(v => v.status === 'completed').pop();
      return { id: b.id, img: b.photo_url, name: b.professional_name, t: b.service_name + (b.is_plan ? ' · ' + b.sessions + ' sessions' : ''), w: open ? fmt(open.starts_at) : fmt(b.created_at), who: b.patient_name, amt: L.inr(b.total_paise / 100), statusText: b.status === 'cancelled' ? 'Cancelled' : 'Completed',
        canRate: !!last && !b.reviewed && !this._rated?.[b.id],
        rate: (n) => api(`/visits/${last.id}/review`, { body: { stars: n } }).then(() => { (this._rated = this._rated || {})[b.id] = true; this.toast('Thank you for your review'); this.forceUpdate(); }).catch(e => this.toast(e.message)),
        online: b.mode === 'online', home: b.mode !== 'online', join: () => window.location.assign('/call/' + b.id),
        track: () => this.go('done', { bookingId: b.id, proId: b.professional_id, live: null }), open: () => p && this.openPro(p.id), rebook: () => p && this.startBook(p.id),
        cancel: () => { if (window.confirm('Cancel this booking?')) api(`/bookings/${b.id}/cancel`, { method: 'POST', body: {} }).then(() => this.refreshBookings()).then(() => this.toast('Booking cancelled')).catch(e => this.toast(e.message)); } }; };
    const on = s.bookings.filter(b => ['confirmed', 'active', 'pending_payment'].includes(b.status)); const past = s.bookings.filter(b => !['confirmed', 'active', 'pending_payment'].includes(b.status));
    return { acUpcoming: on.map(row), acPast: past.map(row), acNoUpcoming: on.length === 0, acNoPast: past.length === 0 };
  }
  async confirm() {
    const s = this.state; const b = s.b; const M = MTH, L = MTHL; const p = M.pros.find(x => x.id === s.proId); const mode = M.CATS[p.cat].mode;
    if (!s.user) { this._afterLogin = 'confirm'; this.setState({ login: true }); return; }
    if (s.me.needs_setup) { this._afterLogin = 'confirm'; this.toSetup(); return; }
    if (s.booking) return; this.setState({ booking: true });
    const online = !!(p.svcs[b.svc] || {}).o;
    const dates = L.sessions(b, mode).map(L.K);
    try {
      const r = await api('/bookings', { body: { professionalId: p.id, serviceIndex: b.svc, plan: !online && !!b.plan, dates, slot: b.slot, hours: b.hours, notes: b.notes, share: b.share, payMethod: b.pay,
        patient: { id: b.patientId, name: b.pname.trim(), age: b.age, gender: b.gender, relation: b.who === 'self' ? 'Me' : (b.pname.trim().split(' ')[0] || 'Family') },
        address: online ? undefined : { addressId: b.addressId, label: 'Home', house: b.house, street: b.street, landmark: b.landmark, locality: b.locality, pincode: String(b.pin || '').trim() } } });
      await this.afterAuth(); this._loadedFor = null;
      this.go('done', { bookingId: r.id, live: null, booking: false });
    } catch (e) {
      this._loadedFor = null; this.loadBooked();
      this.setState(x => ({ booking: false, b: { ...x.b, err: e.message } }));
    }
  }
  render() { return <SiteContext.Provider value={this.renderVals()}>{this.props.children}</SiteContext.Provider>; }
  renderVals() {
    const s = this.state; const mob = s.w < 860;
    const base = {
      ready: s.ready, mob, desk: !mob, isHome: s.view === 'home', isPro: s.view === 'pro', isBook: s.view === 'book', isDone: s.view === 'done', isAbout: s.view === 'about', isJoin: s.view === 'join',
      hdrBg: s.scrolled || s.view !== 'home' ? '#fff' : 'rgba(255,255,255,0)', hdrBd: s.scrolled || s.view !== 'home' ? '#E6E8EF' : 'rgba(230,232,239,0)',
      goHome: () => this.go('home'), goAbout: () => this.go('about'), goJoin: () => this.go('join'), goServices: () => this.scrollTo('mth-services'), goHow: () => this.scrollTo('mth-how'), goBrowse: () => this.scrollTo('mth-browse'), goExplain: () => this.scrollTo('mth-explain'),
      navFg: (v) => v, aboutFg: s.view === 'about' ? '#02084D' : '#4A4F6A', joinFg: s.view === 'join' ? '#02084D' : '#4A4F6A',
      menu: s.menu, toggleMenu: () => this.setState(x => ({ menu: !x.menu })), closeMenu: () => this.setState({ menu: false }),
      sos: s.sos, openSos: () => this.setState({ sos: true, menu: false }), closeSos: () => this.setState({ sos: false }), sosAmb: () => { this.setState({ sos: false }); this.setCat('ambulance', true); },
      login: s.login, openLogin: () => { if (s.me && s.me.needs_setup) this.toSetup(); else this.setState({ login: true, menu: false }); }, closeLogin: () => this.setState({ login: false }),
      me: s.me, patients: s.patients, addresses: s.addresses, areas: Object.keys(MTH.LOCS), area: s.loc,
      savePending: () => { try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ to: this._afterLogin || null, b: s.b, proId: s.proId })); } catch {} },
      signedIn: async () => {
        try { sessionStorage.removeItem(PENDING_KEY); } catch {}
        let me; try { me = await this.afterAuth(); } catch (e) { this.toast(e.message); return; }
        if (me.needs_setup) { this.toSetup(); return; }
        const to = this._afterLogin; this._afterLogin = null; this.toast('You are logged in'); this.setState({ login: false }, () => this.continueAfterLogin(to));
      },
      setupDone: async () => {
        await this.afterAuth();
        let pending = null; try { pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null'); sessionStorage.removeItem(PENDING_KEY); } catch {}
        const to = this._afterLogin || (pending && pending.to) || this._setupFrom || 'home'; this._afterLogin = null; this._setupFrom = null; this.toast('Welcome to Medico To Home');
        this.setState({ login: false, ...(pending && pending.b ? { b: pending.b, proId: pending.proId } : {}) }, () => this.continueAfterLogin(to));
      },
      // Role switcher: shown only to approved professionals.
      isProfessional: !!(s.me && s.me.professional), toProMode: () => setMode('professional').then(() => window.location.assign('/pro')).catch(e => this.toast(e.message)),
      userInitial: ((s.me && s.me.full_name) || (s.me && s.me.email) || 'M')[0].toUpperCase(), goAcct: () => this.go('acct'), acctOrLogin: () => { if (s.me && s.me.needs_setup) this.toSetup(); else if (s.user) this.go('acct'); else { this._afterLogin = 'acct'; this.setState({ login: true, menu: false }); } }, acctLabel: s.user ? 'My profile' : 'Patient login',
      isAcct: s.view === 'acct',
      loggedIn: !!s.user, loggedOut: !s.user, userName: s.user || '',
      toast: s.toast, hasToast: !!s.toast, year: '2026',
      pillLoc: () => { const open = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); this.setState({ locOpen: true, menu: false }); }; if (s.view !== 'home') { this.go('home'); setTimeout(open, 300); } else open(); },
      stop: (e) => e.stopPropagation(),
      fDoctor: () => this.setCat('doctor', true), fNurse: () => this.setCat('nurse', true), fPhysio: () => this.setCat('physio', true), fLab: () => this.setCat('lab', true), fCare: () => this.setCat('caregiver', true),
      faqs: MTH.faqs.map(f => [f.question, f.answer])
        .map(([q, a], i) => ({ q, a, open: s.faq === i, rot: s.faq === i ? '45deg' : '0deg', tog: () => this.setState({ faq: s.faq === i ? -1 : i }) })),
      goApply: () => window.location.assign('/medico'), authReady: s.authReady, proLogin: () => window.location.assign('/medico'),
      earnS: s.earnS, earnP: s.earnP, earnPText: '₹' + s.earnP.toLocaleString('en-IN'), earnMonth: '₹' + (Math.round(s.earnS * s.earnP * 4.3 * 0.88 / 100) * 100).toLocaleString('en-IN'),
      onEarnS: (e) => this.setState({ earnS: +e.target.value }), onEarnP: (e) => this.setState({ earnP: +e.target.value }),
      ...this.joinState(),
      hdrDesk: s.w >= 1120, hdrMob: s.w < 1120, ppSticky: mob ? 'static' : 'sticky', bkSticky: mob ? 'static' : 'sticky',
      searchR: mob ? '24px' : '999px', segL: mob ? 'none' : '1px solid #E6E8EF', segT: mob ? '1px solid #EEF0F5' : 'none', searchBtnW: mob ? '100%' : '140px', searchBtnM: mob ? '8px 0 0' : '0',
    };
    if (!s.ready) return base;
    return { ...base, ...this.homeVals(), ...(this.bookVals ? this.bookVals() : {}), ...(s.view === 'acct' ? this.acctVals() : {}) };
  }
}

export function SiteProvider({ children, catalogue }) {
  setCatalogue(catalogue);
  const router = useRouter();
  const pathname = usePathname();
  return <SiteStore pathname={pathname} navigate={router.push}>{children}</SiteStore>;
}
