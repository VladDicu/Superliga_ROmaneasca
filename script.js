document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.dataset.page || 'grid';
    const normalizeText = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    function hashString(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
        return h;
    }

    const ECHIPAMENTE_CLUBURI = {
        "FCSB": ["#dc2626", "#1d4ed8", "split"],
        "Dinamo București": ["#dc2626", "#ffffff", "sleeves"],
        "Rapid București": ["#7f1d1d", "#ffffff", "sleeves"],
        "CFR Cluj": ["#7f1d1d", "#ffffff", "stripes"],
        "Universitatea Craiova": ["#1d4ed8", "#ffffff", "stripes"],
        "Univ. Craiova": ["#1d4ed8", "#ffffff", "stripes"],
        "Farul Constanța": ["#1e3a8a", "#ffffff", "stripes"],
        "FCV Farul": ["#1e3a8a", "#ffffff", "stripes"],
        "U Cluj": ["#ffffff", "#000000", "stripes"],
        "Petrolul Ploiești": ["#facc15", "#1d4ed8", "split"],
        "Petrolul": ["#facc15", "#1d4ed8", "split"],
        "Oțelul Galați": ["#dc2626", "#ffffff", "stripes"],
        "Sepsi OSK": ["#dc2626", "#ffffff", "hoops"],
        "UTA Arad": ["#dc2626", "#ffffff", "sleeves"],
        "FC Botoșani": ["#dc2626", "#1e3a8a", "stripes"],
        "Hermannstadt": ["#dc2626", "#000000", "stripes"],
        "Poli Iași": ["#1d4ed8", "#ffffff", "stripes"],
        "ACSM Poli Iași": ["#1d4ed8", "#ffffff", "stripes"],
        "Poli Timișoara": ["#7e22ce", "#ffffff", "stripes"],
        "FC Vaslui": ["#facc15", "#15803d", "sleeves"],
        "Unirea Urziceni": ["#1d4ed8", "#000000", "stripes"],
        "Astra Giurgiu": ["#ffffff", "#000000", "stripes"],
        "Gaz Metan Mediaș": ["#000000", "#ffffff", "stripes"],
        "FC Argeș": ["#7e22ce", "#ffffff", "sleeves"],
        "FC Brașov": ["#facc15", "#000000", "stripes"],
        "Gloria Bistrița": ["#1d4ed8", "#ffffff", "sleeves"],
        "Ceahlăul Piatra Neamț": ["#f97316", "#000000", "stripes"],
        "Pandurii Târgu Jiu": ["#1d4ed8", "#ffffff", "sleeves"],
        "Sportul Studențesc": ["#ffffff", "#000000", "hoops"],
        "Progresul / FC Național": ["#38bdf8", "#1e3a8a", "stripes"],
        "Concordia Chiajna": ["#16a34a", "#facc15", "sleeves"],
        "Chindia Târgoviște": ["#dc2626", "#1d4ed8", "split"],
        "FC Voluntari": ["#7f1d1d", "#ffffff", "sleeves"],
        "CS Mioveni": ["#facc15", "#16a34a", "sleeves"],
        "Corvinul Hunedoara": ["#1d4ed8", "#ffffff", "stripes"],
        "România (Naționala Mare)": ["#facc15", "#1d4ed8", "sleeves"],
        "România U21": ["#facc15", "#dc2626", "sleeves"]
    };

    // ==================== GENERATOARE PIXEL ART COMUNE ====================
    function svgTricou(numeClub) {
        let config = ECHIPAMENTE_CLUBURI[numeClub];
        if (!config) {
            const h = hashString(numeClub || "Club");
            const paleta = ["#dc2626", "#1d4ed8", "#16a34a", "#7e22ce", "#ea580c", "#0284c7", "#eab308"];
            const modele = ["stripes", "split", "sleeves", "hoops"];
            config = [paleta[h % paleta.length], "#ffffff", modele[(h >> 3) % modele.length]];
        }
        const [c1, c2, model] = config;
        let patternSVG = '';
        if (model === 'stripes') patternSVG = `<rect x="5" y="3" width="2" height="11" fill="${c2}" /><rect x="9" y="3" width="2" height="11" fill="${c2}" />`;
        else if (model === 'split') patternSVG = `<rect x="8" y="3" width="4" height="11" fill="${c2}" />`;
        else if (model === 'hoops') patternSVG = `<rect x="4" y="5" width="8" height="2" fill="${c2}" /><rect x="4" y="9" width="8" height="2" fill="${c2}" />`;
        else patternSVG = `<rect x="1" y="4" width="3" height="4" fill="${c2}" /><rect x="12" y="4" width="3" height="4" fill="${c2}" />`;

        return `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <path d="M3 1h10l3 3v5h-3v6H3V9H0V4z" fill="#000000" />
            <path d="M4 2h3v2h2V2h3l3 3v3h-3v6H4V8H1V5z" fill="${c1}" />
            ${patternSVG}
            <rect x="6" y="2" width="4" height="2" fill="${c2}" />
        </svg>`;
    }

    function svgTrofeu(numeTrofeu = "") {
        const t = numeTrofeu.toLowerCase();
        if (t.includes("champions") || t.includes("europa") || t.includes("conference")) {
            return `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
                <rect x="3" y="1" width="10" height="14" fill="#000" />
                <rect x="2" y="2" width="2" height="5" fill="#cbd5e1" /><rect x="12" y="2" width="2" height="5" fill="#cbd5e1" />
                <rect x="4" y="2" width="8" height="7" fill="#f8fafc" /><rect x="5" y="3" width="2" height="4" fill="#94a3b8" />
                <rect x="6" y="9" width="4" height="3" fill="#cbd5e1" /><rect x="4" y="12" width="8" height="2" fill="#1e293b" />
            </svg>`;
        }
        return `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <rect x="3" y="1" width="10" height="8" fill="#000" /><rect x="4" y="2" width="8" height="6" fill="#facc15" />
            <rect x="2" y="3" width="2" height="3" fill="#eab308" /><rect x="12" y="3" width="2" height="3" fill="#eab308" />
            <rect x="6" y="8" width="4" height="3" fill="#ca8a04" /><rect x="3" y="11" width="10" height="3" fill="#78350f" />
            <rect x="5" y="12" width="6" height="1" fill="#facc15" />
        </svg>`;
    }

    function svgCaracterMasculin(numePersoana, esteAntrenor = false, culoareEchipament = null) {
        const h = hashString(numePersoana || "Jucator");
        const nuantePiele = ["#fde68a", "#fcd34d", "#fbbf24", "#f59e0b"];
        const culoriPar = ["#090d16", "#451a03", "#78350f", "#92400e", "#d97706", "#64748b"];
        const culoriCostum = ["#1e293b", "#0f172a", "#334155", "#1e3a8a"];
        const culoriCravata = ["#ef4444", "#eab308", "#3b82f6", "#10b981"];

        const piele = nuantePiele[h % nuantePiele.length];
        const par = culoriPar[(h >> 2) % culoriPar.length];
        const haina = esteAntrenor ? culoriCostum[(h >> 3) % culoriCostum.length] : (culoareEchipament || "#ef4444");
        const cravata = culoriCravata[(h >> 5) % culoriCravata.length];

        const hainaSVG = esteAntrenor
            ? `<rect x="2" y="10" width="12" height="6" fill="${haina}" /><rect x="6" y="10" width="4" height="3" fill="#ffffff" /><rect x="7" y="11" width="2" height="5" fill="${cravata}" />`
            : `<rect x="2" y="10" width="12" height="6" fill="${haina}" /><rect x="5" y="10" width="6" height="2" fill="#ffffff" /><rect x="7" y="12" width="2" height="4" fill="#ffffff" />`;

        return `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <rect x="3" y="3" width="10" height="7" fill="#000000" /><rect x="4" y="4" width="8" height="6" fill="${piele}" />
            <rect x="4" y="1" width="8" height="3" fill="${par}" />
            <rect x="5" y="6" width="2" height="2" fill="#000000" /><rect x="9" y="6" width="2" height="2" fill="#000000" />
            <rect x="6" y="8" width="4" height="1" fill="#78350f" />
            ${hainaSVG}
        </svg>`;
    }

    // ==================== PAGINA 1: PIXEL GRID (index.html) ====================
    if (currentPage === 'grid') {
        let dbCategorii = {}, dbJucatori = {}, mapCategorieOptiune = {}, listaNumeJucatori = [];
        let usedPlayers = new Set(), currentPlayer = 'X', activeCell = null;

        const board = document.getElementById('game-board');
        const modal = document.getElementById('search-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalSubtitle = document.getElementById('modal-subtitle');
        const searchInput = document.getElementById('player-search');
        const autocompleteList = document.getElementById('autocomplete-list');
        const statusText = document.getElementById('jucator-curent');

        fetch('jucatori.json?v=' + Date.now())
            .then(r => r.json())
            .then(data => {
                dbCategorii = data.categorii;
                for (const [cat, lista] of Object.entries(dbCategorii)) {
                    lista.forEach(opt => { mapCategorieOptiune[opt] = cat; });
                }
                for (const [nume, p] of Object.entries(data.jucatori)) {
                    dbJucatori[nume] = new Set([...(p.cluburi||[]), ...(p.trofee||[]), ...(p.antrenori||[]), ...(p.competitii||[])]);
                }
                listaNumeJucatori = Object.keys(dbJucatori).sort();
                construiesteGrila();
                genereazaGrilaValida();
            });

        function getMetaCriteriu(optiune) {
            const cat = mapCategorieOptiune[optiune] || "";
            if (optiune.includes("România") || cat.includes("Club")) return { svg: svgTricou(optiune), label: "ECHIPĂ", css: "cat-club" };
            if (cat.includes("Antrenor")) return { svg: svgCaracterMasculin(optiune, true), label: "ANTRENOR", css: "cat-antrenor" };
            return { svg: svgTrofeu(optiune), label: "TROFEU / COMP", css: "cat-trofeu" };
        }

        function construiesteGrila() {
            board.innerHTML = `<div class="cell header empty"><div class="pixel-icon-box">${svgTrofeu()}</div><span style="font-family:'Press Start 2P'; font-size:0.55rem; color:#facc15;">SUPERLIGA<br>8-BIT</span></div>`;
            for (let c = 0; c < 3; c++) board.appendChild(creazaSelector('col', c));
            for (let r = 0; r < 3; r++) {
                board.appendChild(creazaSelector('row', r));
                for (let c = 0; c < 3; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell grid-cell';
                    cell.dataset.r = r; cell.dataset.c = c;
                    cell.addEventListener('click', () => {
                        if (cell.classList.contains('filled')) return;
                        activeCell = cell;
                        modalTitle.textContent = `${cell.dataset.echipa1} × ${cell.dataset.echipa2}`;
                        modalSubtitle.textContent = `${cell.dataset.solutii} FOTBALIȘTI COMUNI`;
                        modal.classList.remove('hidden');
                        searchInput.value = ''; autocompleteList.innerHTML = ''; searchInput.focus();
                    });
                    board.appendChild(cell);
                }
            }
        }

        function creazaSelector(tip, index) {
            const wrapper = document.createElement('div');
            wrapper.className = 'cell header select-header';
            const badge = document.createElement('span'); badge.className = 'badge-categorie cat-club';
            const iconBox = document.createElement('div'); iconBox.className = 'pixel-icon-box';
            const select = document.createElement('select'); select.dataset.tip = tip; select.dataset.index = index;

            for (const [numeCat, optiuni] of Object.entries(dbCategorii)) {
                if (!optiuni || !optiuni.length) continue;
                const grp = document.createElement('optgroup'); grp.label = `=== ${numeCat.toUpperCase()} ===`;
                optiuni.forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; grp.appendChild(opt); });
                select.appendChild(grp);
            }
            select.addEventListener('change', actualizeazaIntersectiile);
            wrapper.append(badge, iconBox, select);
            return wrapper;
        }

        function numaraSolutii(c1, c2) {
            if (c1 === c2) return 0;
            let n = 0;
            for (const s of Object.values(dbJucatori)) if (s.has(c1) && s.has(c2)) n++;
            return n;
        }

        function actualizeazaIntersectiile() {
            const sR = document.querySelectorAll('select[data-tip="row"]');
            const sC = document.querySelectorAll('select[data-tip="col"]');
            usedPlayers.clear();
            document.querySelectorAll('.select-header').forEach(h => {
                const sel = h.querySelector('select');
                const meta = getMetaCriteriu(sel.value);
                h.querySelector('.pixel-icon-box').innerHTML = meta.svg;
                const b = h.querySelector('.badge-categorie');
                b.textContent = meta.label; b.className = `badge-categorie ${meta.css}`;
            });
            document.querySelectorAll('.grid-cell').forEach(cell => {
                const c1 = sR[cell.dataset.r].value, c2 = sC[cell.dataset.c].value;
                cell.dataset.echipa1 = c1; cell.dataset.echipa2 = c2;
                cell.className = 'cell grid-cell'; delete cell.dataset.winner;
                const sol = numaraSolutii(c1, c2); cell.dataset.solutii = sol;
                cell.innerHTML = `<span class="possible-count ${sol === 0 ? 'zero' : ''}">${sol} SOL.</span>`;
            });
            currentPlayer = 'X'; statusText.textContent = 'X'; statusText.className = 'x-color';
        }

        function genereazaGrilaValida() {
            const toate = Object.values(dbCategorii).flat().filter(o => {
                let c = 0; for (const s of Object.values(dbJucatori)) if (s.has(o)) c++;
                return c >= 20;
            });
            for (let i = 0; i < 300; i++) {
                const mix = [...toate].sort(() => 0.5 - Math.random());
                const rows = mix.slice(0, 3), cols = mix.slice(3, 6);
                if (rows.every(r => cols.every(c => numaraSolutii(r, c) >= 2))) {
                    const sR = document.querySelectorAll('select[data-tip="row"]');
                    const sC = document.querySelectorAll('select[data-tip="col"]');
                    rows.forEach((v, idx) => sR[idx].value = v);
                    cols.forEach((v, idx) => sC[idx].value = v);
                    actualizeazaIntersectiile();
                    return;
                }
            }
            actualizeazaIntersectiile();
        }

        document.getElementById('btn-random').addEventListener('click', genereazaGrilaValida);
        document.getElementById('btn-reset').addEventListener('click', actualizeazaIntersectiile);
        document.querySelector('.close-btn').addEventListener('click', () => modal.classList.add('hidden'));

        searchInput.addEventListener('input', () => {
            const q = normalizeText(searchInput.value.trim());
            autocompleteList.innerHTML = '';
            if (q.length < 2) return;
            listaNumeJucatori.filter(n => !usedPlayers.has(n) && normalizeText(n).includes(q)).slice(0, 8).forEach(nume => {
                const li = document.createElement('li');
                li.innerHTML = `<div class="mini-avatar">${svgCaracterMasculin(nume, false, "#16a34a")}</div><span>${nume}</span>`;
                li.addEventListener('click', () => {
                    const c1 = activeCell.dataset.echipa1, c2 = activeCell.dataset.echipa2;
                    if (dbJucatori[nume]?.has(c1) && dbJucatori[nume]?.has(c2)) {
                        usedPlayers.add(nume);
                        const col = currentPlayer === 'X' ? '#ef4444' : '#3b82f6';
                        activeCell.innerHTML = `<div class="winner-badge ${currentPlayer.toLowerCase()}-color">${currentPlayer}</div><div class="pixel-icon-box">${svgCaracterMasculin(nume, false, col)}</div><div class="player-name-tag">${nume}</div>`;
                        activeCell.classList.add('filled'); activeCell.dataset.winner = currentPlayer;
                    } else {
                        alert(`GREȘIT! ${nume} nu are simultan ambele criterii.`);
                    }
                    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                    statusText.textContent = currentPlayer; statusText.className = `${currentPlayer.toLowerCase()}-color`;
                    modal.classList.add('hidden');
                });
                autocompleteList.appendChild(li);
            });
        });
    }

    // ==================== PAGINA 2: CLASAMENTE, GOLGHETERI & PASATORI (clasamente.html) ====================
    if (currentPage === 'istorie') {
        let dbIstorie = {};
        const selectSezon = document.getElementById('select-sezon');
        const selectEtapa = document.getElementById('select-etapa');
        const tbodyClasament = document.querySelector('#tabel-clasament tbody');
        const tbodyMarcatori = document.querySelector('#tabel-marcatori tbody');
        const containerMeciuri = document.getElementById('lista-meciuri');

        fetch('istorie_liga1.json?v=' + Date.now())
            .then(r => r.json())
            .then(data => {
                dbIstorie = data.sezoane || {};
                const sezoane = Object.keys(dbIstorie).sort().reverse();
                sezoane.forEach(s => {
                    const opt = document.createElement('option'); opt.value = s; opt.textContent = s;
                    selectSezon.appendChild(opt);
                });
                selectSezon.addEventListener('change', () => afiseazaSezon(selectSezon.value));
                selectEtapa.addEventListener('change', () => afiseazaEtapa(selectSezon.value, selectEtapa.value));
                if (sezoane.length) afiseazaSezon(sezoane[0]);
            });

        function afiseazaSezon(sezon) {
            const d = dbIstorie[sezon];
            if (!d) return;

            // 1. Clasament
            tbodyClasament.innerHTML = '';
            (d.clasament || []).forEach(r => {
                const rat = r.rating || { ovr: 70, att: 70, def: 70 };
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${r.poz}</td><td><div class="echipa-cell"><div class="mini-kit">${svgTricou(r.echipa)}</div><span>${r.echipa}</span></div></td><td>${r.m}</td><td>${r.v}</td><td>${r.e}</td><td>${r.i}</td><td>${r.golaveraj}</td><td><strong>${r.pct}</strong></td><td><span class="ovr-badge">${rat.ovr}</span></td>`;
                tbodyClasament.appendChild(tr);
            });

            // 2. Golgheteri & Pasatori Decisivi
            tbodyMarcatori.innerHTML = '';
            const stats = d.statistici_jucatori || [];
            if (stats.length === 0) {
                tbodyMarcatori.innerHTML = `<tr><td colspan="5">Rulează <b>python extrage_istorie_liga1.py</b> pentru a popula golgheterii și pasatorii!</td></tr>`;
            } else {
                stats.forEach((st, idx) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${idx + 1}</td>
                        <td><div class="echipa-cell"><div class="mini-kit">${svgCaracterMasculin(st.jucator, false, "#16a34a")}</div><span>${st.jucator}</span></div></td>
                        <td><div class="echipa-cell"><div class="mini-kit">${svgTricou(st.echipa)}</div><span>${st.echipa}</span></div></td>
                        <td><strong style="color:#facc15">${st.goluri}</strong></td>
                        <td><strong style="color:#38bdf8">${st.pase}</strong></td>
                    `;
                    tbodyMarcatori.appendChild(tr);
                });
            }

            // 3. Etape
            const etape = Object.keys(d.etape || {});
            selectEtapa.innerHTML = '';
            etape.forEach(et => {
                const opt = document.createElement('option'); opt.value = et; opt.textContent = et;
                selectEtapa.appendChild(opt);
            });
            if (etape.length) afiseazaEtapa(sezon, etape[0]);
        }

        function afiseazaEtapa(sezon, etapa) {
            const meciuri = (dbIstorie[sezon]?.etape || {})[etapa] || [];
            containerMeciuri.innerHTML = '';
            meciuri.forEach(m => {
                const card = document.createElement('div');
                card.className = 'match-card';
                card.innerHTML = `
                    <div class="match-scoreline">
                        <div class="echipa-cell"><div class="mini-kit">${svgTricou(m.gazda)}</div><span>${m.gazda}</span></div>
                        <span class="score-box">${m.scor}</span>
                        <div class="echipa-cell"><span>${m.oaspete}</span><div class="mini-kit">${svgTricou(m.oaspete)}</div></div>
                    </div>
                `;
                containerMeciuri.appendChild(card);
            });
        }
    }

    // ==================== PAGINA 3: MECI 11v11 CU NOUL MOTOR TACTIC AI (meci.html) ====================
    if (currentPage === 'meci') {
        const canvas = document.getElementById('pitch-canvas');
        const ctx = canvas.getContext('2d');
        const selHome = document.getElementById('select-echipa-home');
        const selAway = document.getElementById('select-echipa-away');
        const ovrHomeBadge = document.getElementById('ovr-home');
        const ovrAwayBadge = document.getElementById('ovr-away');
        const scoreHomeEl = document.getElementById('score-home');
        const scoreAwayEl = document.getElementById('score-away');
        const nameHomeEl = document.getElementById('score-home-name');
        const nameAwayEl = document.getElementById('score-away-name');
        const timerEl = document.getElementById('match-timer');
        const goalBanner = document.getElementById('goal-banner');

        let ratingCluburi = {};
        const keys = {};
        let timerInterval = null;

        const FORMATIE_433 = [
            { rol: "GK",  linie: "GK",  x: 48,  y: 270 },
            { rol: "LB",  linie: "DEF", x: 175, y: 95  },
            { rol: "CB1", linie: "DEF", x: 155, y: 210 },
            { rol: "CB2", linie: "DEF", x: 155, y: 330 },
            { rol: "RB",  linie: "DEF", x: 175, y: 445 },
            { rol: "CM1", linie: "MID", x: 310, y: 145 },
            { rol: "CDM", linie: "MID", x: 280, y: 270 },
            { rol: "CM2", linie: "MID", x: 310, y: 395 },
            { rol: "LW",  linie: "ATT", x: 430, y: 105 },
            { rol: "ST",  linie: "ATT", x: 445, y: 270 },
            { rol: "RW",  linie: "ATT", x: 430, y: 435 }
        ];

        const matchState = {
            running: false, goalCooldown: 0, timeLeft: 120,
            scoreHome: 0, scoreAway: 0,
            homeTeam: "FCSB", awayTeam: "Dinamo București",
            homeColors: ["#dc2626", "#1d4ed8"], awayColors: ["#ffffff", "#dc2626"],
            activeIdx: 9, players: [],
            ball: { x: 460, y: 270, z: 0, vx: 0, vy: 0, vz: 0, owner: null, pickupCooldown: 0 }
        };

        window.addEventListener('keydown', (e) => {
            keys[e.code] = true;
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code) && matchState.running) e.preventDefault();
            if (!matchState.running || matchState.goalCooldown > 0 || e.repeat) return;
            if (e.code === 'KeyS') executaActiuneS();
            if (e.code === 'KeyA') executaActiuneA();
            if (e.code === 'KeyD') executaActiuneD();
        });
        window.addEventListener('keyup', (e) => { keys[e.code] = false; });

        fetch('istorie_liga1.json?v=' + Date.now())
            .then(r => r.ok ? r.json() : { sezoane: {} })
            .catch(() => ({ sezoane: {} }))
            .then(data => {
                for (const sez of Object.values(data.sezoane || {})) {
                    (sez.clasament || []).forEach(row => {
                        if (!ratingCluburi[row.echipa] || row.rating.ovr > ratingCluburi[row.echipa].ovr) {
                            ratingCluburi[row.echipa] = row.rating;
                        }
                    });
                }
                const cluburi = Object.keys(ECHIPAMENTE_CLUBURI).filter(c => !c.includes("România"));
                [selHome, selAway].forEach((sel, idx) => {
                    sel.innerHTML = '';
                    cluburi.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; sel.appendChild(opt); });
                    sel.value = idx === 0 ? "FCSB" : "Dinamo București";
                    sel.addEventListener('change', actualizeazaPreviewEchipe);
                });
                document.getElementById('btn-start-match').addEventListener('click', pornesteMeci);
                actualizeazaPreviewEchipe();
                requestAnimationFrame(gameLoop11v11);
            });

        function getRating(nume) { return ratingCluburi[nume] || { ovr: 78, att: 78, def: 76 }; }

        function actualizeazaPreviewEchipe() {
            const h = selHome.value, a = selAway.value;
            ovrHomeBadge.textContent = `OVR ${getRating(h).ovr}`;
            ovrAwayBadge.textContent = `OVR ${getRating(a).ovr}`;
            nameHomeEl.textContent = h.toUpperCase(); nameAwayEl.textContent = a.toUpperCase();
            matchState.homeTeam = h; matchState.awayTeam = a;
            matchState.homeColors = ECHIPAMENTE_CLUBURI[h] || ["#dc2626", "#1d4ed8"];
            matchState.awayColors = ECHIPAMENTE_CLUBURI[a] || ["#ffffff", "#dc2626"];
            reseteazaPozitii();
        }

        function pornesteMeci() {
            matchState.scoreHome = 0; matchState.scoreAway = 0; matchState.timeLeft = 120; matchState.running = true;
            scoreHomeEl.textContent = "0"; scoreAwayEl.textContent = "0";
            reseteazaPozitii();
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                if (!matchState.running || matchState.goalCooldown > 0) return;
                matchState.timeLeft--;
                timerEl.textContent = `${String(Math.floor(matchState.timeLeft / 60)).padStart(2, '0')}:${String(matchState.timeLeft % 60).padStart(2, '0')}`;
                if (matchState.timeLeft <= 0) {
                    matchState.running = false; clearInterval(timerInterval);
                    alert(`FLUIER FINAL! ${matchState.homeTeam} ${matchState.scoreHome} - ${matchState.scoreAway} ${matchState.awayTeam}`);
                }
            }, 1000);
        }

        function reseteazaPozitii() {
            const rH = getRating(matchState.homeTeam), rA = getRating(matchState.awayTeam);
            const spH = 1.9 + (rH.ovr - 65) * 0.018, spA = 1.85 + (rA.ovr - 65) * 0.018;
            matchState.players = [];

            FORMATIE_433.forEach((pos, idx) => {
                matchState.players.push({
                    id: idx, team: 'home', rol: pos.rol, linie: pos.linie,
                    homeX: pos.x, homeY: pos.y, x: pos.x, y: pos.y,
                    dirX: 1, dirY: 0, speed: spH, stamina: 100,
                    aiDecisionTimer: 0, slideTimer: 0, stunTimer: 0
                });
            });
            FORMATIE_433.forEach((pos, idx) => {
                matchState.players.push({
                    id: 11 + idx, team: 'away', rol: pos.rol, linie: pos.linie,
                    homeX: canvas.width - pos.x, homeY: pos.y, x: canvas.width - pos.x, y: pos.y,
                    dirX: -1, dirY: 0, speed: spA, stamina: 100,
                    aiDecisionTimer: 15, slideTimer: 0, stunTimer: 0
                });
            });
            matchState.activeIdx = 9;
            matchState.ball = { x: canvas.width / 2, y: canvas.height / 2, z: 0, vx: 0, vy: 0, vz: 0, owner: null, pickupCooldown: 0 };
        }

        function getDirTaste(p) {
            let dx = 0, dy = 0;
            if (keys['ArrowLeft']) dx -= 1; if (keys['ArrowRight']) dx += 1;
            if (keys['ArrowUp']) dy -= 1; if (keys['ArrowDown']) dy += 1;
            if (dx === 0 && dy === 0) return { dx: p.dirX || 1, dy: p.dirY || 0 };
            const l = Math.hypot(dx, dy); return { dx: dx / l, dy: dy / l };
        }

        function executaActiuneS() {
            const p = matchState.players[matchState.activeIdx], b = matchState.ball;
            if (b.owner === p) {
                const { dx, dy } = getDirTaste(p);
                let tinta = null, best = -999;
                matchState.players.filter(c => c.team === 'home' && c !== p).forEach(col => {
                    const vx = col.x - p.x, vy = col.y - p.y, d = Math.hypot(vx, vy);
                    if (d > 15 && d < 400) {
                        const dot = (vx / d) * dx + (vy / d) * dy;
                        const s = dot * 2.5 - (d / 360);
                        if (dot > 0.2 && s > best) { best = s; tinta = col; }
                    }
                });
                b.owner = null; b.pickupCooldown = 10;
                if (tinta) {
                    const ang = Math.atan2(tinta.y - p.y, tinta.x - p.x);
                    const pwr = Math.min(9.5, Math.max(5.8, Math.hypot(tinta.x - p.x, tinta.y - p.y) * 0.042));
                    b.vx = Math.cos(ang) * pwr; b.vy = Math.sin(ang) * pwr;
                    matchState.activeIdx = tinta.id;
                } else { b.vx = dx * 7.5; b.vy = dy * 7.5; }
                b.vz = 0;
            } else {
                let bestIdx = matchState.activeIdx, minD = 9999;
                for (let i = 1; i < 11; i++) {
                    const d = Math.hypot(matchState.players[i].x - b.x, matchState.players[i].y - b.y);
                    if (d < minD) { minD = d; bestIdx = i; }
                }
                matchState.activeIdx = bestIdx;
            }
        }

        function executaActiuneA() {
            const p = matchState.players[matchState.activeIdx], b = matchState.ball;
            if (b.owner === p) {
                const { dx, dy } = getDirTaste(p);
                b.owner = null; b.pickupCooldown = 12;
                b.vx = dx * 8.4; b.vy = dy * 8.4; b.vz = 5.5;
            } else if (Math.hypot(b.x - p.x, b.y - p.y) < 28 && b.z < 12) {
                if (b.owner && b.owner.team === 'away') b.owner.stunTimer = 28;
                b.owner = p;
            }
        }

        function executaActiuneD() {
            const p = matchState.players[matchState.activeIdx], b = matchState.ball;
            if (b.owner === p) {
                const { dx, dy } = getDirTaste(p);
                const tx = dx >= -0.2 ? 912 : p.x + dx * 200, ty = 270 + dy * 52;
                const ang = Math.atan2(ty - p.y, tx - p.x);
                const pwr = 11.2 + (getRating(matchState.homeTeam).att - 65) * 0.08;
                b.owner = null; b.pickupCooldown = 12;
                b.vx = Math.cos(ang) * pwr; b.vy = Math.sin(ang) * pwr; b.vz = 1.6;
            } else if (p.slideTimer <= 0) {
                const { dx, dy } = getDirTaste(p);
                p.dirX = dx; p.dirY = dy; p.slideTimer = 24;
            }
        }

        // ==================== MOTORUL TACTIC AI RESCRIS DE LA ZERO ====================
        function verificaCuloarLiber(pStart, pEnd, echipaAdversa) {
            const dx = pEnd.x - pStart.x, dy = pEnd.y - pStart.y, dist = Math.hypot(dx, dy);
            if (dist < 25) return false;
            for (const adv of matchState.players) {
                if (adv.team !== echipaAdversa) continue;
                const t = ((adv.x - pStart.x) * dx + (adv.y - pStart.y) * dy) / (dist * dist);
                if (t > 0.1 && t < 0.95) {
                    const projX = pStart.x + t * dx, projY = pStart.y + t * dy;
                    if (Math.hypot(adv.x - projX, adv.y - projY) < 24) return false;
                }
            }
            return true;
        }

        function actualizeazaAITactic(p, b) {
            const isHome = p.team === 'home';
            const echipaAdv = isHome ? 'away' : 'home';

            // 1. PORTARUL (Poziționare pe bisectoare + Pasă scurtă la fundaș liber)
            if (p.rol === 'GK') {
                const goalX = isHome ? 44 : canvas.width - 44;
                const targetY = Math.max(208, Math.min(332, 270 + (b.y - 270) * 0.45));
                p.x += (goalX - p.x) * 0.16; p.y += (targetY - p.y) * 0.14;
                p.dirX = isHome ? 1 : -1;

                if (!isHome && b.owner === p) {
                    p.aiDecisionTimer--;
                    if (p.aiDecisionTimer <= 0) {
                        const fundasiLiberi = matchState.players.filter(c => c.team === 'away' && c.linie === 'DEF' && verificaCuloarLiber(p, c, 'home'));
                        b.owner = null; b.pickupCooldown = 14;
                        if (fundasiLiberi.length > 0) {
                            const f = fundasiLiberi[Math.floor(Math.random() * fundasiLiberi.length)];
                            const ang = Math.atan2(f.y - p.y, f.x - p.x);
                            b.vx = Math.cos(ang) * 7.8; b.vy = Math.sin(ang) * 7.8; b.vz = 0;
                        } else {
                            b.vx = -9.2; b.vy = (Math.random() - 0.5) * 5; b.vz = 4.2;
                        }
                    }
                }
                return;
            }

            // 2. PURTĂTORUL DE MINGE AI (Evitare adversari + Pasă în triunghi + Șut plasat)
            if (!isHome && b.owner === p) {
                p.aiDecisionTimer--;
                const poartaX = 22, poartaY = 270;
                const distPoarta = Math.hypot(poartaX - p.x, poartaY - p.y);

                // A. Dacă e în careu și are unghi -> Șutează la colț!
                if (distPoarta < 205 && p.aiDecisionTimer <= 0) {
                    const coltY = p.y < 270 ? 225 : 315;
                    const ang = Math.atan2(coltY - p.y, poartaX - p.x);
                    b.owner = null; b.pickupCooldown = 14;
                    b.vx = Math.cos(ang) * 11.2; b.vy = Math.sin(ang) * 11.2; b.vz = 1.4;
                    return;
                }

                // B. Căutăm câți adversari îl presează
                let vecEvitareX = 0, vecEvitareY = 0, presiune = 0;
                matchState.players.forEach(adv => {
                    if (adv.team === 'home') {
                        const d = Math.hypot(p.x - adv.x, p.y - adv.y);
                        if (d < 70 && d > 1) {
                            presiune++;
                            vecEvitareX += ((p.x - adv.x) / d) * (70 - d) * 0.04;
                            vecEvitareY += ((p.y - adv.y) / d) * (70 - d) * 0.04;
                        }
                    }
                });

                // C. Evaluăm opțiunile de pasă (Utility Scoring) dacă e presat sau vede un coleg demarcat
                if (p.aiDecisionTimer <= 0 && (presiune > 0 || Math.random() < 0.35)) {
                    let bestCol = null, maxUtility = 15;
                    matchState.players.filter(c => c.team === 'away' && c !== p && c.rol !== 'GK').forEach(col => {
                        const d = Math.hypot(col.x - p.x, col.y - p.y);
                        if (d < 60 || d > 360) return;
                        if (!verificaCuloarLiber(p, col, 'home')) return;

                        const progresieSprePoarta = (p.x - col.x) * 0.35; // Cu cât colegul e mai în stânga (spre poarta ta), cu atât mai bine
                        const distAdversarColeg = Math.min(...matchState.players.filter(h => h.team === 'home').map(h => Math.hypot(col.x - h.x, col.y - h.y)));
                        const utility = progresieSprePoarta + Math.min(80, distAdversarColeg * 0.6);

                        if (utility > maxUtility) { maxUtility = utility; bestCol = col; }
                    });

                    if (bestCol) {
                        // Pasăm anticipat pe direcția de alergare a colegului
                        const leadX = bestCol.x - 18, leadY = bestCol.y;
                        const ang = Math.atan2(leadY - p.y, leadX - p.x);
                        const pwr = Math.min(9.2, Math.max(5.8, Math.hypot(leadX - p.x, leadY - p.y) * 0.042));
                        b.owner = null; b.pickupCooldown = 12;
                        b.vx = Math.cos(ang) * pwr; b.vy = Math.sin(ang) * pwr;
                        // Dacă colegul e în careu pe flanc opus -> Centrare pe sus!
                        b.vz = (bestCol.x < 180 && Math.abs(bestCol.y - p.y) > 130) ? 4.8 : 0;
                        return;
                    }
                    p.aiDecisionTimer = 14;
                }

                // D. Dribling inteligent cu ocolirea adversarilor (Vector Field)
                const dirPoartaX = (poartaX - p.x) / distPoarta;
                const dirPoartaY = (poartaY - p.y) / distPoarta;
                let finalX = dirPoartaX + vecEvitareX * 1.35;
                let finalY = dirPoartaY + vecEvitareY * 1.65;

                // Evităm ieșirea în aut de margine
                if (p.y < 65) finalY += 0.8;
                if (p.y > canvas.height - 65) finalY -= 0.8;

                const len = Math.hypot(finalX, finalY) || 1;
                p.dirX = finalX / len; p.dirY = finalY / len;
                p.x += p.dirX * p.speed; p.y += p.dirY * p.speed;
                return;
            }

            // 3. JUCĂTORII FĂRĂ MINGE (Demarcare în atac / Închidere culoare și Presing în apărare)
            const aiArePosesia = b.owner && b.owner.team === 'away';
            const tuAiPosesia = b.owner && b.owner.team === 'home';

            let targetX = p.homeX + (b.x - canvas.width / 2) * 0.42;
            let targetY = p.homeY + (b.y - canvas.height / 2) * 0.28;

            if (!isHome) {
                if (aiArePosesia) {
                    // Când AI-ul atacă: atacanții și mijlocașii fac sprinturi de demarcare spre poarta ta
                    if (p.linie === 'ATT') targetX -= 75;
                    if (p.linie === 'MID') targetX -= 45;
                } else {
                    // Când TU ataci: doar cel mai apropiat jucător AI face presing direct la minge, restul închid culoarele!
                    const colegiCamp = matchState.players.filter(a => a.team === 'away' && a.rol !== 'GK');
                    colegiCamp.sort((a, c) => Math.hypot(b.x - a.x, b.y - a.y) - Math.hypot(b.x - c.x, b.y - c.y));

                    if (colegiCamp[0] === p || (colegiCamp[1] === p && b.x > 550)) {
                        // Presing pe purtătorul de minge
                        targetX = b.x - 8; targetY = b.y;
                        const distMinge = Math.hypot(b.x - p.x, b.y - p.y);
                        if (tuAiPosesia && distMinge < 20 && Math.random() < 0.085) {
                            b.owner.stunTimer = 22;
                            b.owner = p;
                            p.aiDecisionTimer = 16;
                        }
                    } else if (p.linie === 'DEF') {
                        // Fundașii AI se retrag între minge și propria poartă
                        targetX = Math.max(b.x + 45, p.homeX);
                    }
                }
            } else {
                // Coechipierii tăi controlați de AI: urcă în atac când ai mingea
                if (tuAiPosesia && p.linie === 'ATT') targetX += 70;
                if (tuAiPosesia && p.linie === 'MID') targetX += 40;
            }

            const dx = targetX - p.x, dy = targetY - p.y, d = Math.hypot(dx, dy);
            if (d > 5) {
                p.dirX = dx / d; p.dirY = dy / d;
                p.x += p.dirX * (p.speed * 0.88); p.y += p.dirY * (p.speed * 0.88);
            }
        }

        function actualizeazaFizica11v11() {
            if (!matchState.running) return;
            if (matchState.goalCooldown > 0) {
                if (--matchState.goalCooldown === 0) { goalBanner.classList.add('hidden'); reseteazaPozitii(); }
                return;
            }

            const b = matchState.ball;
            if (b.pickupCooldown > 0) b.pickupCooldown--;

            matchState.players.forEach((p, idx) => {
                if (p.stunTimer > 0) { p.stunTimer--; return; }

                if (p.slideTimer > 0) {
                    p.slideTimer--;
                    p.x += p.dirX * p.speed * 1.9; p.y += p.dirY * p.speed * 1.9;
                    if (Math.hypot(b.x - p.x, b.y - p.y) < 22 && b.z < 10) {
                        if (b.owner && b.owner !== p) b.owner.stunTimer = 32;
                        b.owner = null; b.pickupCooldown = 10;
                        b.vx = p.dirX * 7.5; b.vy = p.dirY * 7.5;
                    }
                    p.x = Math.max(24, Math.min(canvas.width - 24, p.x));
                    p.y = Math.max(24, Math.min(canvas.height - 24, p.y));
                    return;
                }

                if (idx === matchState.activeIdx) {
                    let mx = 0, my = 0;
                    if (keys['ArrowLeft']) mx -= 1; if (keys['ArrowRight']) mx += 1;
                    if (keys['ArrowUp']) my -= 1; if (keys['ArrowDown']) my += 1;
                    const sprint = keys['KeyW'] && p.stamina > 5;
                    p.stamina = (sprint && (mx || my)) ? Math.max(0, p.stamina - 0.4) : Math.min(100, p.stamina + 0.22);

                    if (mx || my) {
                        const l = Math.hypot(mx, my);
                        p.dirX = mx / l; p.dirY = my / l;
                        p.x += p.dirX * p.speed * (sprint ? 1.42 : 1);
                        p.y += p.dirY * p.speed * (sprint ? 1.42 : 1);
                    }
                } else {
                    p.stamina = Math.min(100, p.stamina + 0.25);
                    actualizeazaAITactic(p, b);
                }

                p.x = Math.max(24, Math.min(canvas.width - 24, p.x));
                p.y = Math.max(24, Math.min(canvas.height - 24, p.y));

                if (!b.owner && b.pickupCooldown <= 0 && b.z < 12 && Math.hypot(b.x - p.x, b.y - p.y) < 14) {
                    b.owner = p;
                    p.aiDecisionTimer = 18;
                    if (p.team === 'home') matchState.activeIdx = p.id;
                }
            });

            if (b.owner) {
                b.x = b.owner.x + b.owner.dirX * 10;
                b.y = b.owner.y + b.owner.dirY * 10;
                b.z = 0;
            } else {
                b.x += b.vx; b.y += b.vy;
                b.vx *= 0.965; b.vy *= 0.965;
                if (b.z > 0 || b.vz !== 0) {
                    b.z += b.vz; b.vz -= 0.28;
                    if (b.z <= 0) { b.z = 0; b.vz = Math.abs(b.vz) > 0.7 ? -b.vz * 0.45 : 0; }
                }
            }

            if (b.y > 205 && b.y < 335 && b.z < 28) {
                if (b.x <= 22) {
                    matchState.scoreAway++; scoreAwayEl.textContent = matchState.scoreAway;
                    goalBanner.textContent = `GOL ${matchState.awayTeam.toUpperCase()}!`;
                    goalBanner.classList.remove('hidden'); matchState.goalCooldown = 95; return;
                }
                if (b.x >= canvas.width - 22) {
                    matchState.scoreHome++; scoreHomeEl.textContent = matchState.scoreHome;
                    goalBanner.textContent = `GOOOL ${matchState.homeTeam.toUpperCase()}!`;
                    goalBanner.classList.remove('hidden'); matchState.goalCooldown = 95; return;
                }
            }
            if (b.x < 22) { b.x = 22; b.vx = -b.vx * 0.7; }
            if (b.x > canvas.width - 22) { b.x = canvas.width - 22; b.vx = -b.vx * 0.7; }
            if (b.y < 20) { b.y = 20; b.vy = -b.vy * 0.7; }
            if (b.y > canvas.height - 20) { b.y = canvas.height - 20; b.vy = -b.vy * 0.7; }
        }

        function gameLoop11v11() {
            actualizeazaFizica11v11();
            const w = canvas.width, h = canvas.height;
            for (let i = 0; i < 10; i++) {
                ctx.fillStyle = i % 2 === 0 ? "#15803d" : "#166534";
                ctx.fillRect(i * (w / 10), 0, w / 10, h);
            }
            ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 4;
            ctx.strokeRect(22, 20, w - 44, h - 40);
            ctx.beginPath(); ctx.moveTo(w / 2, 20); ctx.lineTo(w / 2, h - 20); ctx.stroke();
            ctx.beginPath(); ctx.arc(w / 2, h / 2, 62, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeRect(22, 135, 130, 270); ctx.strokeRect(22, 195, 52, 150);
            ctx.strokeRect(w - 152, 135, 130, 270); ctx.strokeRect(w - 74, 195, 52, 150);
            ctx.fillStyle = "#f8fafc"; ctx.fillRect(6, 205, 16, 130); ctx.fillRect(w - 22, 205, 16, 130);

            matchState.players.forEach((p, idx) => {
                const [c1, c2] = p.team === 'home' ? matchState.homeColors : matchState.awayColors;
                if (idx === matchState.activeIdx) {
                    ctx.strokeStyle = "#facc15"; ctx.lineWidth = 3; ctx.strokeRect(p.x - 11, p.y - 4, 22, 14);
                    ctx.fillStyle = "#000"; ctx.fillRect(p.x - 10, p.y + 12, 20, 4);
                    ctx.fillStyle = p.stamina > 30 ? "#4ade80" : "#ef4444";
                    ctx.fillRect(p.x - 9, p.y + 13, (p.stamina / 100) * 18, 2);
                }
                const sl = p.slideTimer > 0 ? p.dirX * 6 : 0;
                ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(p.x - 7, p.y + 6, 14, 4);
                ctx.fillStyle = p.rol === 'GK' ? "#22c55e" : c1; ctx.fillRect(p.x - 7 + sl, p.y - 6, 14, 10);
                ctx.fillStyle = p.rol === 'GK' ? "#000" : c2; ctx.fillRect(p.x - 3 + sl, p.y - 6, 6, 10);
                ctx.fillStyle = "#fcd34d"; ctx.fillRect(p.x - 5, p.y - 14, 10, 8);
                ctx.fillStyle = "#451a03"; ctx.fillRect(p.x - 5, p.y - 16, 10, 3);
            });

            const b = matchState.ball, by = b.y - b.z, sz = 8 + Math.min(4, b.z * 0.15);
            ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.fillRect(b.x - 4, b.y + 2, 8, 5);
            ctx.fillStyle = "#000"; ctx.fillRect(b.x - sz / 2 - 1, by - sz / 2 - 1, sz + 2, sz + 2);
            ctx.fillStyle = "#fff"; ctx.fillRect(b.x - sz / 2, by - sz / 2, sz, sz);
            requestAnimationFrame(gameLoop11v11);
        }
    }
});
