document.addEventListener('DOMContentLoaded', () => {
    let dbCategorii = {};
    let dbJucatori = {};
    let mapCategorieOptiune = {};
    let listaNumeJucatori = [];
    let usedPlayers = new Set();
    let currentPlayer = 'X';
    let activeCell = null;

    const board = document.getElementById('game-board');
    const modal = document.getElementById('search-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const searchInput = document.getElementById('player-search');
    const autocompleteList = document.getElementById('autocomplete-list');
    const statusText = document.getElementById('jucator-curent');
    const closeBtn = document.querySelector('.close-btn');
    const btnRandom = document.getElementById('btn-random');
    const btnReset = document.getElementById('btn-reset');

    const normalizeText = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    function hashString(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = (h * 31 + str.charCodeAt(i)) >>> 0;
        }
        return h;
    }

    const ANTRENORI_CONSACRATI = new Set([
        "Mircea Lucescu", "Anghel Iordănescu", "Dan Petrescu", "Gheorghe Hagi",
        "Cosmin Olăroiu", "Laurențiu Reghecampf", "Marius Șumudică", "Victor Pițurcă",
        "Ioan Andone", "Mircea Rednic", "Răzvan Lucescu", "Dorinel Munteanu",
        "Ovidiu Sabău", "Ioan Ovidiu Sabău", "Elias Charalambous", "Edward Iordănescu",
        "Cristiano Bergodi", "Andrea Mandorlini", "Laszlo Bölöni", "Ladislau Bölöni",
        "Costel Gâlcă", "Constantin Gâlcă", "Ilie Dumitrescu", "Gavril Balint",
        "Sorin Cârțu", "Dumitru Dumitriu", "Emeric Ienei", "Florin Halagian",
        "Viorel Hizo", "Marin Ion", "Ionuț Popa", "Petre Grigoraș",
        "Mihai Teja", "Liviu Ciobotariu", "Eugen Neagoe", "Leo Grozavu",
        "Flavius Stoican", "Vasile Miriuță", "Toni Conceição", "Jorge Costa",
        "Dušan Uhrin Jr.", "Oleg Protasov", "Walter Zenga", "Mirel Rădoi",
        "Adrian Mutu", "Cristian Chivu", "Nicolae Dică", "Ilie Stan",
        "Tibor Selymes", "Gheorghe Mulțescu", "Aurel Țicleanu", "Ilie Balaci", "Cornel Dinu"
    ]);

    const ECHIPAMENTE_CLUBURI = {
        "FCSB": ["#dc2626", "#1d4ed8", "split"],
        "Dinamo București": ["#dc2626", "#ffffff", "sleeves"],
        "Rapid București": ["#7f1d1d", "#ffffff", "sleeves"],
        "CFR Cluj": ["#7f1d1d", "#ffffff", "stripes"],
        "Universitatea Craiova": ["#1d4ed8", "#ffffff", "stripes"],
        "Farul Constanța": ["#1e3a8a", "#ffffff", "stripes"],
        "U Cluj": ["#ffffff", "#000000", "stripes"],
        "Petrolul Ploiești": ["#facc15", "#1d4ed8", "split"],
        "Oțelul Galați": ["#dc2626", "#ffffff", "stripes"],
        "Sepsi OSK": ["#dc2626", "#ffffff", "hoops"],
        "UTA Arad": ["#dc2626", "#ffffff", "sleeves"],
        "FC Botoșani": ["#dc2626", "#1e3a8a", "stripes"],
        "Hermannstadt": ["#dc2626", "#000000", "stripes"],
        "Poli Iași": ["#1d4ed8", "#ffffff", "stripes"],
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

    // ==================== GENERATOR PIXEL ART (SVG) ====================

    function svgTricou(numeClub) {
        let config = ECHIPAMENTE_CLUBURI[numeClub];
        if (!config) {
            const h = hashString(numeClub);
            const paleta = ["#dc2626", "#1d4ed8", "#16a34a", "#7e22ce", "#ea580c", "#0284c7", "#eab308"];
            const modele = ["stripes", "split", "sleeves", "hoops"];
            config = [paleta[h % paleta.length], "#ffffff", modele[(h >> 3) % modele.length]];
        }
        const [c1, c2, model] = config;

        let patternSVG = '';
        if (model === 'stripes') {
            patternSVG = `<rect x="5" y="3" width="2" height="11" fill="${c2}" /><rect x="9" y="3" width="2" height="11" fill="${c2}" />`;
        } else if (model === 'split') {
            patternSVG = `<rect x="8" y="3" width="4" height="11" fill="${c2}" />`;
        } else if (model === 'hoops') {
            patternSVG = `<rect x="4" y="5" width="8" height="2" fill="${c2}" /><rect x="4" y="9" width="8" height="2" fill="${c2}" />`;
        } else {
            patternSVG = `<rect x="1" y="4" width="3" height="4" fill="${c2}" /><rect x="12" y="4" width="3" height="4" fill="${c2}" />`;
        }

        return `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <path d="M3 1h10l3 3v5h-3v6H3V9H0V4z" fill="#000000" />
            <path d="M4 2h3v2h2V2h3l3 3v3h-3v6H4V8H1V5z" fill="${c1}" />
            ${patternSVG}
            <rect x="6" y="2" width="4" height="2" fill="${c2}" />
        </svg>`;
    }

    function svgTrofeu(numeTrofeu) {
        const t = numeTrofeu.toLowerCase();
        if (t.includes("champions") || t.includes("europa") || t.includes("conference")) {
            return `
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
                <rect x="3" y="1" width="10" height="14" fill="#000" />
                <rect x="2" y="2" width="2" height="5" fill="#cbd5e1" />
                <rect x="12" y="2" width="2" height="5" fill="#cbd5e1" />
                <rect x="4" y="2" width="8" height="7" fill="#f8fafc" />
                <rect x="5" y="3" width="2" height="4" fill="#94a3b8" />
                <rect x="6" y="9" width="4" height="3" fill="#cbd5e1" />
                <rect x="4" y="12" width="8" height="2" fill="#1e293b" />
            </svg>`;
        }
        if (t.includes("golgheter")) {
            return `
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
                <rect x="2" y="3" width="6" height="6" fill="#000" />
                <rect x="3" y="4" width="4" height="5" fill="#facc15" />
                <rect x="2" y="8" width="12" height="4" fill="#eab308" />
                <rect x="3" y="12" width="2" height="2" fill="#fff" />
                <rect x="7" y="12" width="2" height="2" fill="#fff" />
                <rect x="11" y="12" width="2" height="2" fill="#fff" />
            </svg>`;
        }
        return `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <rect x="3" y="1" width="10" height="8" fill="#000" />
            <rect x="4" y="2" width="8" height="6" fill="#facc15" />
            <rect x="2" y="3" width="2" height="3" fill="#eab308" />
            <rect x="12" y="3" width="2" height="3" fill="#eab308" />
            <rect x="6" y="8" width="4" height="3" fill="#ca8a04" />
            <rect x="3" y="11" width="10" height="3" fill="#78350f" />
            <rect x="5" y="12" width="6" height="1" fill="#facc15" />
        </svg>`;
    }

    function svgCaracterMasculin(numePersoana, esteAntrenor = false, culoareEchipament = null) {
        const h = hashString(numePersoana || "Jucator");
        const nuantePiele = ["#fde68a", "#fcd34d", "#fbbf24", "#f59e0b"];
        const culoriPar = ["#090d16", "#451a03", "#78350f", "#92400e", "#d97706", "#64748b"];
        const culoriCostum = ["#1e293b", "#0f172a", "#334155", "#1e3a8a", "#3f3f46"];
        const culoriCravata = ["#ef4444", "#eab308", "#3b82f6", "#10b981"];

        const piele = nuantePiele[h % nuantePiele.length];
        const par = culoriPar[(h >> 2) % culoriPar.length];
        const tipFrizura = (h >> 4) % 4;
        const areBarba = ((h >> 6) % 3) === 0;

        const haina = esteAntrenor ? culoriCostum[(h >> 3) % culoriCostum.length] : (culoareEchipament || "#ef4444");
        const cravata = culoriCravata[(h >> 5) % culoriCravata.length];

        let parSVG = '';
        if (tipFrizura === 0) {
            parSVG = `<rect x="4" y="1" width="8" height="3" fill="${par}" /><rect x="3" y="2" width="1" height="3" fill="${par}" /><rect x="12" y="2" width="1" height="3" fill="${par}" />`;
        } else if (tipFrizura === 1) {
            parSVG = `<rect x="4" y="2" width="8" height="2" fill="${par}" />`;
        } else if (tipFrizura === 2) {
            parSVG = `<rect x="3" y="1" width="10" height="3" fill="${par}" /><rect x="4" y="4" width="3" height="1" fill="${par}" />`;
        } else {
            parSVG = `<rect x="4" y="2" width="8" height="2" fill="${piele}" /><rect x="3" y="3" width="1" height="2" fill="${par}" /><rect x="12" y="3" width="1" height="2" fill="${par}" />`;
        }

        const barbaSVG = areBarba 
            ? `<rect x="4" y="8" width="8" height="2" fill="${par}" /><rect x="6" y="8" width="4" height="1" fill="#b91c1c" />`
            : `<rect x="6" y="8" width="4" height="1" fill="#78350f" />`;

        const hainaSVG = esteAntrenor
            ? `<rect x="2" y="10" width="12" height="6" fill="${haina}" /><rect x="6" y="10" width="4" height="3" fill="#ffffff" /><rect x="7" y="11" width="2" height="5" fill="${cravata}" />`
            : `<rect x="2" y="10" width="12" height="6" fill="${haina}" /><rect x="5" y="10" width="6" height="2" fill="#ffffff" /><rect x="7" y="12" width="2" height="4" fill="#ffffff" />`;

        return `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <rect x="3" y="3" width="10" height="7" fill="#000000" />
            <rect x="4" y="4" width="8" height="6" fill="${piele}" />
            ${parSVG}
            <rect x="5" y="6" width="2" height="2" fill="#000000" />
            <rect x="9" y="6" width="2" height="2" fill="#000000" />
            ${barbaSVG}
            ${hainaSVG}
        </svg>`;
    }

    function getMetaCriteriu(optiune) {
        const cat = mapCategorieOptiune[optiune] || "";
        if (optiune === "România (Naționala Mare)" || optiune === "România U21" || cat.includes("Club")) {
            return { svg: svgTricou(optiune), label: "ECHIPĂ", css: "cat-club" };
        }
        if (cat.includes("Antrenor")) {
            return { svg: svgCaracterMasculin(optiune, true), label: "ANTRENOR", css: "cat-antrenor" };
        }
        if (cat.includes("Competiții") || optiune.includes("UEFA") || optiune.includes("EURO") || optiune.includes("Mondială")) {
            return { svg: svgTrofeu(optiune), label: "COMPETIȚIE", css: "cat-comp" };
        }
        return { svg: svgTrofeu(optiune), label: "TROFEU / LIGĂ", css: "cat-trofeu" };
    }

    // ==================== COMUTARE TAB-URI ====================
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-view').forEach(v => v.classList.add('hidden'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.remove('hidden');
        });
    });

    // ==================== MODULUL 1: PIXEL GRID (X & 0) ====================
    fetch('jucatori.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            dbCategorii = data.categorii;

            if (dbCategorii["Antrenori"]) {
                const antrenoriFiltrati = dbCategorii["Antrenori"].filter(a => ANTRENORI_CONSACRATI.has(a));
                if (antrenoriFiltrati.length >= 8) {
                    dbCategorii["Antrenori"] = antrenoriFiltrati;
                }
            }

            for (const [cat, lista] of Object.entries(dbCategorii)) {
                lista.forEach(opt => { mapCategorieOptiune[opt] = cat; });
            }

            for (const [nume, profil] of Object.entries(data.jucatori)) {
                const toateTagurile = [
                    ...(profil.cluburi || []),
                    ...(profil.trofee || []),
                    ...(profil.antrenori || []),
                    ...(profil.competitii || [])
                ];
                dbJucatori[nume] = new Set(toateTagurile);
            }

            listaNumeJucatori = Object.keys(dbJucatori).sort();
            construiesteGrila();
            genereazaGrilaValida();
        })
        .catch(err => console.error("Eroare la încărcarea jucatori.json:", err));

    function construiesteGrila() {
        board.innerHTML = `
            <div class="cell header empty">
                <div class="pixel-icon-box">${svgTrofeu("Campion Liga 1")}</div>
                <span style="font-family:'Press Start 2P'; font-size:0.55rem; color:#facc15;">SUPERLIGA<br>8-BIT</span>
            </div>
        `;

        for (let c = 0; c < 3; c++) {
            board.appendChild(creazaSelector('col', c));
        }

        for (let r = 0; r < 3; r++) {
            board.appendChild(creazaSelector('row', r));
            for (let c = 0; c < 3; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell grid-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.addEventListener('click', () => deschideModal(cell));
                board.appendChild(cell);
            }
        }
    }

    function creazaSelector(tip, index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'cell header select-header';

        const badge = document.createElement('span');
        badge.className = 'badge-categorie cat-club';
        badge.textContent = 'ECHIPĂ';

        const iconBox = document.createElement('div');
        iconBox.className = 'pixel-icon-box';

        const select = document.createElement('select');
        select.dataset.tip = tip;
        select.dataset.index = index;

        for (const [numeCat, optiuni] of Object.entries(dbCategorii)) {
            if (!optiuni || optiuni.length === 0) continue;
            const optgroup = document.createElement('optgroup');
            optgroup.label = `=== ${numeCat.toUpperCase()} ===`;

            optiuni.forEach(optiune => {
                const opt = document.createElement('option');
                opt.value = optiune;
                opt.textContent = optiune;
                optgroup.appendChild(opt);
            });
            select.appendChild(optgroup);
        }

        select.addEventListener('change', actualizeazaIntersectiile);

        wrapper.appendChild(badge);
        wrapper.appendChild(iconBox);
        wrapper.appendChild(select);
        return wrapper;
    }

    function numaraSolutii(c1, c2) {
        if (c1 === c2) return 0;
        let count = 0;
        for (const tagSet of Object.values(dbJucatori)) {
            if (tagSet.has(c1) && tagSet.has(c2)) count++;
        }
        return count;
    }

    function actualizeazaIntersectiile() {
        const selectsRow = document.querySelectorAll('select[data-tip="row"]');
        const selectsCol = document.querySelectorAll('select[data-tip="col"]');
        usedPlayers.clear();

        document.querySelectorAll('.select-header').forEach(header => {
            const sel = header.querySelector('select');
            const box = header.querySelector('.pixel-icon-box');
            const badge = header.querySelector('.badge-categorie');
            if (sel && box && badge) {
                const meta = getMetaCriteriu(sel.value);
                box.innerHTML = meta.svg;
                badge.textContent = meta.label;
                badge.className = `badge-categorie ${meta.css}`;
            }
        });

        document.querySelectorAll('.grid-cell').forEach(cell => {
            const r = cell.dataset.r;
            const c = cell.dataset.c;
            const c1 = selectsRow[r].value;
            const c2 = selectsCol[c].value;

            cell.dataset.echipa1 = c1;
            cell.dataset.echipa2 = c2;
            cell.className = 'cell grid-cell';
            delete cell.dataset.winner;

            const nrSolutii = numaraSolutii(c1, c2);
            cell.dataset.solutii = nrSolutii;
            cell.innerHTML = `<span class="possible-count ${nrSolutii === 0 ? 'zero' : ''}">${nrSolutii} SOL.</span>`;
        });

        currentPlayer = 'X';
        statusText.textContent = currentPlayer;
        statusText.className = 'x-color';
    }

    function genereazaGrilaValida() {
        const cheiCat = Object.keys(dbCategorii);
        const catCluburi = cheiCat.find(k => k.toLowerCase().includes("club")) || cheiCat[0];
        const catTrofee = cheiCat.find(k => k.toLowerCase().includes("trofee")) || cheiCat[1];
        const catAntrenori = cheiCat.find(k => k.toLowerCase().includes("antrenor")) || cheiCat[2];
        const catComp = cheiCat.find(k => k.toLowerCase().includes("competi")) || cheiCat[3];

        const cluburiValide = (dbCategorii[catCluburi] || []).filter(c => {
            let n = 0;
            for (const s of Object.values(dbJucatori)) if (s.has(c)) n++;
            return n >= 25;
        });

        const antrenoriValizi = (dbCategorii[catAntrenori] || []);
        const trofeeValide = [
            ...(dbCategorii[catTrofee] || []),
            ...(dbCategorii[catComp] || [])
        ];

        const pickRandom = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

        for (let incercare = 0; incercare < 350; incercare++) {
            const cluburiAlese = pickRandom(cluburiValide, 4);
            const antAles = pickRandom(antrenoriValizi, 1);
            const trofAles = pickRandom(trofeeValide, 1);

            if (cluburiAlese.length < 4) break;

            const rows = [cluburiAlese[0], cluburiAlese[1], ...(antAles.length ? antAles : [cluburiAlese[2]])];
            const cols = [cluburiAlese[2], cluburiAlese[3], ...(trofAles.length ? trofAles : [cluburiAlese[0]])];

            if (new Set([...rows, ...cols]).size < 6) continue;

            let ok = true;
            for (const r of rows) {
                for (const c of cols) {
                    if (numaraSolutii(r, c) < 2) {
                        ok = false;
                        break;
                    }
                }
                if (!ok) break;
            }

            if (ok) {
                const selectsRow = document.querySelectorAll('select[data-tip="row"]');
                const selectsCol = document.querySelectorAll('select[data-tip="col"]');
                rows.forEach((val, idx) => selectsRow[idx].value = val);
                cols.forEach((val, idx) => selectsCol[idx].value = val);
                actualizeazaIntersectiile();
                return;
            }
        }
        actualizeazaIntersectiile();
    }

    btnRandom.addEventListener('click', genereazaGrilaValida);
    btnReset.addEventListener('click', actualizeazaIntersectiile);

    function deschideModal(cell) {
        if (cell.classList.contains('filled')) return;
        activeCell = cell;
        modalTitle.textContent = `${cell.dataset.echipa1} × ${cell.dataset.echipa2}`;
        modalSubtitle.textContent = `${cell.dataset.solutii} FOTBALIȘTI COMUNI ÎN BAZA DE DATE`;
        modal.classList.remove('hidden');
        searchInput.value = '';
        autocompleteList.innerHTML = '';
        searchInput.focus();
    }

    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

    searchInput.addEventListener('input', () => {
        const query = normalizeText(searchInput.value.trim());
        autocompleteList.innerHTML = '';
        if (query.length < 2) return;

        const matches = listaNumeJucatori
            .filter(nume => !usedPlayers.has(nume) && normalizeText(nume).includes(query))
            .slice(0, 8);

        matches.forEach(nume => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="mini-avatar">${svgCaracterMasculin(nume, false, "#16a34a")}</div>
                <span>${nume}</span>
            `;
            li.addEventListener('click', () => valideazaAlegere(nume));
            autocompleteList.appendChild(li);
        });
    });

    function valideazaAlegere(playerName) {
        if (!activeCell) return;

        const c1 = activeCell.dataset.echipa1;
        const c2 = activeCell.dataset.echipa2;
        const taguri = dbJucatori[playerName];

        if (taguri && taguri.has(c1) && taguri.has(c2)) {
            usedPlayers.add(playerName);
            const culoareEchipament = currentPlayer === 'X' ? '#ef4444' : '#3b82f6';

            activeCell.innerHTML = `
                <div class="winner-badge ${currentPlayer.toLowerCase()}-color">${currentPlayer}</div>
                <div class="pixel-icon-box">${svgCaracterMasculin(playerName, false, culoareEchipament)}</div>
                <div class="player-name-tag" title="${playerName}">${playerName}</div>
            `;
            activeCell.classList.add('filled');
            activeCell.dataset.winner = currentPlayer;

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusText.textContent = currentPlayer;
            statusText.className = `${currentPlayer.toLowerCase()}-color`;

            modal.classList.add('hidden');
            verificaCastig();
        } else {
            alert(`GREȘIT! ${playerName} nu îndeplinește simultan ambele criterii. Rândul trece la adversar!`);
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusText.textContent = currentPlayer;
            statusText.className = `${currentPlayer.toLowerCase()}-color`;
            modal.classList.add('hidden');
        }
    }

    function verificaCastig() {
        const cells = Array.from(document.querySelectorAll('.grid-cell'));
        const getMark = (cell) => cell.dataset.winner || '';

        const linii = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const [a, b, c] of linii) {
            const mA = getMark(cells[a]);
            if (mA && mA === getMark(cells[b]) && mA === getMark(cells[c])) {
                setTimeout(() => alert(`🏆 VICTORIE PENTRU JUCĂTORUL ${mA}!`), 150);
                return;
            }
        }
    }

    // ==================== MODULUL 2: ISTORIE CLASAMENTE & MECIURI ====================
    let dbIstorie = {};
    const selectSezon = document.getElementById('select-sezon');
    const selectEtapa = document.getElementById('select-etapa');
    const tbodyClasament = document.querySelector('#tabel-clasament tbody');
    const containerMeciuri = document.getElementById('lista-meciuri');

    fetch('istorie_liga1.json?v=' + Date.now())
        .then(res => res.ok ? res.json() : Promise.reject("Nu există istorie_liga1.json"))
        .then(data => {
            dbIstorie = data.sezoane || {};
            populeazaSelectSezoane();
            initMiniFotbal();
        })
        .catch(() => {
            if (containerMeciuri) {
                containerMeciuri.innerHTML = `<div class="match-card">Rulează <b>python extrage_istorie_liga1.py</b> pentru a popula clasamentele și meciurile!</div>`;
            }
            initMiniFotbal();
        });

    function populeazaSelectSezoane() {
        const sezoane = Object.keys(dbIstorie).sort().reverse();
        selectSezon.innerHTML = '';
        sezoane.forEach(sez => {
            const opt = document.createElement('option');
            opt.value = sez;
            opt.textContent = sez;
            selectSezon.appendChild(opt);
        });

        selectSezon.addEventListener('change', () => afiseazaSezon(selectSezon.value));
        selectEtapa.addEventListener('change', () => afiseazaEtapa(selectSezon.value, selectEtapa.value));

        if (sezoane.length > 0) afiseazaSezon(sezoane[0]);
    }

    function afiseazaSezon(sezon) {
        const dateSezon = dbIstorie[sezon];
        if (!dateSezon) return;

        tbodyClasament.innerHTML = '';
        (dateSezon.clasament || []).forEach(rand => {
            const tr = document.createElement('tr');
            const r = rand.rating || { ovr: 70, att: 70, def: 70 };
            tr.innerHTML = `
                <td>${rand.poz}</td>
                <td>
                    <div class="echipa-cell">
                        <div class="mini-kit">${svgTricou(rand.echipa)}</div>
                        <span>${rand.echipa}</span>
                    </div>
                </td>
                <td>${rand.m}</td>
                <td>${rand.v}</td>
                <td>${rand.e}</td>
                <td>${rand.i}</td>
                <td>${rand.golaveraj}</td>
                <td><strong>${rand.pct}</strong></td>
                <td><span class="ovr-badge">${r.ovr}</span> <small>(${r.att}/${r.def})</small></td>
            `;
            tbodyClasament.appendChild(tr);
        });

        const etape = Object.keys(dateSezon.etape || {});
        selectEtapa.innerHTML = '';
        etape.forEach(et => {
            const opt = document.createElement('option');
            opt.value = et;
            opt.textContent = et;
            selectEtapa.appendChild(opt);
        });

        if (etape.length > 0) {
            afiseazaEtapa(sezon, etape[0]);
        } else {
            containerMeciuri.innerHTML = `<div class="match-card">Nu sunt etape detaliate salvate pentru acest sezon.</div>`;
        }
    }

    function afiseazaEtapa(sezon, etapa) {
        const meciuri = (dbIstorie[sezon]?.etape || {})[etapa] || [];
        containerMeciuri.innerHTML = '';

        meciuri.forEach(m => {
            const card = document.createElement('div');
            card.className = 'match-card';
            const htmlMarcatori = (m.marcatori && m.marcatori.length > 0)
                ? `<div class="match-scorers">⚽ ${m.marcatori.join(' • ')}</div>`
                : '';

            card.innerHTML = `
                <div class="match-scoreline">
                    <div class="echipa-cell">
                        <div class="mini-kit">${svgTricou(m.gazda)}</div>
                        <span>${m.gazda}</span>
                    </div>
                    <span class="score-box">${m.scor}</span>
                    <div class="echipa-cell">
                        <span>${m.oaspete}</span>
                        <div class="mini-kit">${svgTricou(m.oaspete)}</div>
                    </div>
                </div>
                ${htmlMarcatori}
            `;
            containerMeciuri.appendChild(card);
        });
    }

    // ==================== MODULUL 3: MOTORUL DE FOTBAL 11v11 VS AI ====================
    const canvas = document.getElementById('pitch-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const selHome = document.getElementById('select-echipa-home');
    const selAway = document.getElementById('select-echipa-away');
    const ovrHomeBadge = document.getElementById('ovr-home');
    const ovrAwayBadge = document.getElementById('ovr-away');
    const btnStartMatch = document.getElementById('btn-start-match');
    const scoreHomeEl = document.getElementById('score-home');
    const scoreAwayEl = document.getElementById('score-away');
    const nameHomeEl = document.getElementById('score-home-name');
    const nameAwayEl = document.getElementById('score-away-name');
    const timerEl = document.getElementById('match-timer');
    const goalBanner = document.getElementById('goal-banner');

    let ratingCluburi = {};
    const keys = {};
    let timerInterval = null;
    let loopStarted = false;

    const FORMATIE_433 = [
        { rol: "GK",  x: 48,  y: 270 },
        { rol: "LB",  x: 175, y: 95  },
        { rol: "CB1", x: 155, y: 210 },
        { rol: "CB2", x: 155, y: 330 },
        { rol: "RB",  x: 175, y: 445 },
        { rol: "CM1", x: 305, y: 145 },
        { rol: "CDM", x: 280, y: 270 },
        { rol: "CM2", x: 305, y: 395 },
        { rol: "LW",  x: 425, y: 110 },
        { rol: "ST",  x: 440, y: 270 },
        { rol: "RW",  x: 425, y: 430 }
    ];

    const matchState = {
        running: false,
        goalCooldown: 0,
        timeLeft: 120,
        scoreHome: 0,
        scoreAway: 0,
        homeTeam: "FCSB",
        awayTeam: "Dinamo București",
        homeColors: ["#dc2626", "#1d4ed8"],
        awayColors: ["#ffffff", "#dc2626"],
        activeIdx: 9,
        players: [],
        ball: { x: 460, y: 270, z: 0, vx: 0, vy: 0, vz: 0, owner: null }
    };

    window.addEventListener('keydown', (e) => {
        if (document.activeElement === searchInput) return;
        keys[e.code] = true;

        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code) && matchState.running) {
            e.preventDefault();
        }

        if (!matchState.running || matchState.goalCooldown > 0) return;

        if (!e.repeat) {
            if (e.code === 'KeyS') executaActiuneS();
            if (e.code === 'KeyA') executaActiuneA();
            if (e.code === 'KeyD') executaActiuneD();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    function initMiniFotbal() {
        if (!canvas || loopStarted) return;
        loopStarted = true;

        for (const sez of Object.values(dbIstorie)) {
            (sez.clasament || []).forEach(row => {
                if (!ratingCluburi[row.echipa] || row.rating.ovr > ratingCluburi[row.echipa].ovr) {
                    ratingCluburi[row.echipa] = row.rating;
                }
            });
        }

        const cluburi = Object.keys(ECHIPAMENTE_CLUBURI).filter(c => !c.includes("România"));
        [selHome, selAway].forEach((sel, idx) => {
            sel.innerHTML = '';
            cluburi.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                sel.appendChild(opt);
            });
            sel.value = idx === 0 ? "FCSB" : "Dinamo București";
            sel.addEventListener('change', actualizeazaPreviewEchipeMeci);
        });

        btnStartMatch.addEventListener('click', pornesteMeci11v11);
        actualizeazaPreviewEchipeMeci();
        requestAnimationFrame(gameLoop11v11);
    }

    function getRatingEchipa(nume) {
        return ratingCluburi[nume] || { ovr: 76, att: 76, def: 75 };
    }

    function actualizeazaPreviewEchipeMeci() {
        const h = selHome.value;
        const a = selAway.value;
        const rH = getRatingEchipa(h);
        const rA = getRatingEchipa(a);

        ovrHomeBadge.textContent = `OVR ${rH.ovr}`;
        ovrAwayBadge.textContent = `OVR ${rA.ovr}`;
        nameHomeEl.textContent = h.toUpperCase();
        nameAwayEl.textContent = a.toUpperCase();

        matchState.homeTeam = h;
        matchState.awayTeam = a;
        matchState.homeColors = ECHIPAMENTE_CLUBURI[h] || ["#dc2626", "#1d4ed8"];
        matchState.awayColors = ECHIPAMENTE_CLUBURI[a] || ["#ffffff", "#dc2626"];
        reseteazaPozitii11v11();
    }

    function pornesteMeci11v11() {
        matchState.scoreHome = 0;
        matchState.scoreAway = 0;
        matchState.timeLeft = 120;
        matchState.running = true;
        scoreHomeEl.textContent = "0";
        scoreAwayEl.textContent = "0";
        reseteazaPozitii11v11();

        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!matchState.running || matchState.goalCooldown > 0) return;
            matchState.timeLeft--;
            const min = String(Math.floor(matchState.timeLeft / 60)).padStart(2, '0');
            const sec = String(matchState.timeLeft % 60).padStart(2, '0');
            timerEl.textContent = `${min}:${sec}`;

            if (matchState.timeLeft <= 0) {
                matchState.running = false;
                clearInterval(timerInterval);
                alert(`FLUIER FINAL! ${matchState.homeTeam} ${matchState.scoreHome} - ${matchState.scoreAway} ${matchState.awayTeam}`);
            }
        }, 1000);
    }

    function reseteazaPozitii11v11() {
        const rH = getRatingEchipa(matchState.homeTeam);
        const rA = getRatingEchipa(matchState.awayTeam);
        const baseSpeedH = 1.85 + (rH.ovr - 60) * 0.018;
        const baseSpeedA = 1.80 + (rA.ovr - 60) * 0.018;

        matchState.players = [];

        FORMATIE_433.forEach((pos, idx) => {
            matchState.players.push({
                id: idx,
                team: 'home',
                rol: pos.rol,
                homeX: pos.x,
                homeY: pos.y,
                x: pos.x,
                y: pos.y,
                dirX: 1,
                dirY: 0,
                speed: baseSpeedH,
                stamina: 100,
                tackleTimer: 0,
                slideTimer: 0,
                stunTimer: 0
            });
        });

        FORMATIE_433.forEach((pos, idx) => {
            matchState.players.push({
                id: 11 + idx,
                team: 'away',
                rol: pos.rol,
                homeX: canvas.width - pos.x,
                homeY: pos.y,
                x: canvas.width - pos.x,
                y: pos.y,
                dirX: -1,
                dirY: 0,
                speed: baseSpeedA,
                stamina: 100,
                tackleTimer: 0,
                slideTimer: 0,
                stunTimer: 0
            });
        });

        matchState.activeIdx = 9;
        matchState.ball = { x: canvas.width / 2, y: canvas.height / 2, z: 0, vx: 0, vy: 0, vz: 0, owner: null };
    }

    function getDirectieTaste(p) {
        let dx = 0, dy = 0;
        if (keys['ArrowLeft']) dx -= 1;
        if (keys['ArrowRight']) dx += 1;
        if (keys['ArrowUp']) dy -= 1;
        if (keys['ArrowDown']) dy += 1;
        if (dx === 0 && dy === 0) return { dx: p.dirX || 1, dy: p.dirY || 0 };
        const len = Math.hypot(dx, dy);
        return { dx: dx / len, dy: dy / len };
    }

    function executaActiuneS() {
        const p = matchState.players[matchState.activeIdx];
        const b = matchState.ball;

        if (b.owner === p) {
            const { dx, dy } = getDirectieTaste(p);
            let tinta = null;
            let bestScore = -999;

            matchState.players.filter(pl => pl.team === 'home' && pl !== p).forEach(coechipier => {
                const vx = coechipier.x - p.x;
                const vy = coechipier.y - p.y;
                const dist = Math.hypot(vx, vy);
                if (dist > 10 && dist < 380) {
                    const dot = (vx / dist) * dx + (vy / dist) * dy;
                    const score = dot * 2.5 - (dist / 350);
                    if (dot > 0.25 && score > bestScore) {
                        bestScore = score;
                        tinta = coechipier;
                    }
                }
            });

            b.owner = null;
            if (tinta) {
                const angle = Math.atan2(tinta.y - p.y, tinta.x - p.x);
                const power = Math.min(9.5, Math.max(5.5, Math.hypot(tinta.x - p.x, tinta.y - p.y) * 0.042));
                b.vx = Math.cos(angle) * power;
                b.vy = Math.sin(angle) * power;
                matchState.activeIdx = tinta.id;
            } else {
                b.vx = dx * 7.2;
                b.vy = dy * 7.2;
            }
            b.vz = 0;
        } else {
            schimbaPeCelMaiApropiatJucator();
        }
    }

    function executaActiuneA() {
        const p = matchState.players[matchState.activeIdx];
        const b = matchState.ball;

        if (b.owner === p) {
            const { dx, dy } = getDirectieTaste(p);
            b.owner = null;
            b.vx = dx * 8.2;
            b.vy = dy * 8.2;
            b.vz = 5.4;
        } else if (p.tackleTimer <= 0 && p.slideTimer <= 0) {
            p.tackleTimer = 18;
            const dist = Math.hypot(b.x - p.x, b.y - p.y);
            if (dist < 28 && b.z < 12) {
                if (b.owner && b.owner.team === 'away') {
                    b.owner.stunTimer = 28;
                }
                b.owner = p;
            }
        }
    }

    function executaActiuneD() {
        const p = matchState.players[matchState.activeIdx];
        const b = matchState.ball;
        const rH = getRatingEchipa(matchState.homeTeam);

        if (b.owner === p) {
            const { dx, dy } = getDirectieTaste(p);
            let targetX = dx >= 0 ? 910 : p.x + dx * 200;
            let targetY = 270 + dy * 55;
            const angle = Math.atan2(targetY - p.y, targetX - p.x);
            const shotPower = 10.5 + (rH.att - 65) * 0.08;

            b.owner = null;
            b.vx = Math.cos(angle) * shotPower;
            b.vy = Math.sin(angle) * shotPower;
            b.vz = 1.8;
        } else if (p.slideTimer <= 0 && p.tackleTimer <= 0) {
            const { dx, dy } = getDirectieTaste(p);
            p.dirX = dx;
            p.dirY = dy;
            p.slideTimer = 26;
        }
    }

    function schimbaPeCelMaiApropiatJucator() {
        const b = matchState.ball;
        let bestIdx = matchState.activeIdx;
        let minDist = 9999;

        for (let i = 1; i < 11; i++) {
            const pl = matchState.players[i];
            const d = Math.hypot(pl.x - b.x, pl.y - b.y);
            if (d < minDist) {
                minDist = d;
                bestIdx = i;
            }
        }
        matchState.activeIdx = bestIdx;
    }

    function actualizeazaFizica11v11() {
        if (!matchState.running) return;
        if (matchState.goalCooldown > 0) {
            matchState.goalCooldown--;
            if (matchState.goalCooldown === 0) {
                goalBanner.classList.add('hidden');
                reseteazaPozitii11v11();
            }
            return;
        }

        const b = matchState.ball;

        matchState.players.forEach((p, idx) => {
            if (p.tackleTimer > 0) p.tackleTimer--;
            if (p.stunTimer > 0) { p.stunTimer--; return; }

            if (p.slideTimer > 0) {
                p.slideTimer--;
                p.x += p.dirX * (p.speed * 1.95);
                p.y += p.dirY * (p.speed * 1.95);
                if (Math.hypot(b.x - p.x, b.y - p.y) < 22 && b.z < 10) {
                    if (b.owner && b.owner !== p) b.owner.stunTimer = 35;
                    b.owner = null;
                    b.vx = p.dirX * 7.5;
                    b.vy = p.dirY * 7.5;
                }
                mentinePeTeren(p);
                return;
            }

            if (idx === matchState.activeIdx) {
                let mx = 0, my = 0;
                if (keys['ArrowLeft']) mx -= 1;
                if (keys['ArrowRight']) mx += 1;
                if (keys['ArrowUp']) my -= 1;
                if (keys['ArrowDown']) my += 1;

                const sprinting = keys['KeyW'] && p.stamina > 5;
                if (sprinting && (mx !== 0 || my !== 0)) {
                    p.stamina = Math.max(0, p.stamina - 0.42);
                } else {
                    p.stamina = Math.min(100, p.stamina + 0.22);
                }

                if (mx !== 0 || my !== 0) {
                    const len = Math.hypot(mx, my);
                    p.dirX = mx / len;
                    p.dirY = my / len;
                    const mult = sprinting ? 1.45 : 1.0;
                    p.x += p.dirX * p.speed * mult;
                    p.y += p.dirY * p.speed * mult;
                }
            } else {
                p.stamina = Math.min(100, p.stamina + 0.25);
                actualizeazaAIJucator(p, b);
            }

            mentinePeTeren(p);

            if (!b.owner && b.z < 12 && Math.hypot(b.x - p.x, b.y - p.y) < 14) {
                b.owner = p;
                if (p.team === 'home' && p.rol !== 'GK') {
                    matchState.activeIdx = p.id;
                }
            }
        });

        if (b.owner) {
            b.x = b.owner.x + b.owner.dirX * 10;
            b.y = b.owner.y + b.owner.dirY * 10;
            b.z = 0;
            b.vx = b.owner.dirX * 2;
            b.vy = b.owner.dirY * 2;

            if (b.owner.team === 'home' && b.owner.rol === 'GK') {
                matchState.activeIdx = 0;
            }
        } else {
            b.x += b.vx;
            b.y += b.vy;
            b.vx *= 0.965;
            b.vy *= 0.965;

            if (b.z > 0 || b.vz !== 0) {
                b.z += b.vz;
                b.vz -= 0.28;
                if (b.z <= 0) {
                    b.z = 0;
                    b.vz = -b.vz * 0.45;
                    if (Math.abs(b.vz) < 0.6) b.vz = 0;
                }
            }
        }

        verificaLimiteleSiGolul(b);
    }

    function actualizeazaAIJucator(p, b) {
        const isHome = p.team === 'home';

        if (p.rol === 'GK') {
            const limitaX = isHome ? 46 : canvas.width - 46;
            const targetY = Math.max(210, Math.min(330, b.y));
            p.x += (limitaX - p.x) * 0.15;
            p.y += (targetY - p.y) * 0.12;
            p.dirX = isHome ? 1 : -1;

            if (!isHome && b.owner === p) {
                b.owner = null;
                b.vx = -8.5;
                b.vy = (Math.random() - 0.5) * 5;
                b.vz = 3.5;
            }
            return;
        }

        if (b.owner === p && !isHome) {
            const poartaX = 20, poartaY = 270;
            const distPoarta = Math.hypot(poartaX - p.x, poartaY - p.y);
            const angle = Math.atan2(poartaY - p.y, poartaX - p.x);
            p.dirX = Math.cos(angle);
            p.dirY = Math.sin(angle);
            p.x += p.dirX * (p.speed * 1.05);
            p.y += p.dirY * (p.speed * 1.05);

            if (distPoarta < 195 && Math.random() < 0.06) {
                b.owner = null;
                b.vx = p.dirX * 10.5;
                b.vy = (Math.random() - 0.5) * 4;
                b.vz = 1.2;
            } else if (Math.random() < 0.025) {
                const colegi = matchState.players.filter(c => c.team === 'away' && c.x < p.x - 30);
                if (colegi.length > 0) {
                    const t = colegi[Math.floor(Math.random() * colegi.length)];
                    const ang = Math.atan2(t.y - p.y, t.x - p.x);
                    b.owner = null;
                    b.vx = Math.cos(ang) * 7.5;
                    b.vy = Math.sin(ang) * 7.5;
                }
            }
            return;
        }

        const offsetAtac = (b.x - canvas.width / 2) * 0.38;
        let targetX = p.homeX + offsetAtac;
        let targetY = p.homeY + (b.y - canvas.height / 2) * 0.25;

        if (!isHome) {
            const distMinge = Math.hypot(b.x - p.x, b.y - p.y);
            const celMaiApropiatAI = matchState.players
                .filter(a => a.team === 'away' && a.rol !== 'GK')
                .sort((a, c) => Math.hypot(b.x - a.x, b.y - a.y) - Math.hypot(b.x - c.x, b.y - c.y))[0];

            if (celMaiApropiatAI === p) {
                targetX = b.x;
                targetY = b.y;
                if (b.owner && b.owner.team === 'home' && distMinge < 20 && Math.random() < 0.08) {
                    b.owner.stunTimer = 20;
                    b.owner = p;
                }
            }
        }

        const dx = targetX - p.x;
        const dy = targetY - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 4) {
            p.dirX = dx / dist;
            p.dirY = dy / dist;
            p.x += p.dirX * (p.speed * 0.85);
            p.y += p.dirY * (p.speed * 0.85);
        }
    }

    function mentinePeTeren(p) {
        p.x = Math.max(24, Math.min(canvas.width - 24, p.x));
        p.y = Math.max(24, Math.min(canvas.height - 24, p.y));
    }

    function verificaLimiteleSiGolul(b) {
        const goalTop = 205, goalBottom = 335;

        if (b.y > goalTop && b.y < goalBottom && b.z < 28) {
            if (b.x <= 22) {
                inregistreazaGol('away');
                return;
            }
            if (b.x >= canvas.width - 22) {
                inregistreazaGol('home');
                return;
            }
        }

        if (b.x < 22) { b.x = 22; b.vx = -b.vx * 0.7; }
        if (b.x > canvas.width - 22) { b.x = canvas.width - 22; b.vx = -b.vx * 0.7; }
        if (b.y < 20) { b.y = 20; b.vy = -b.vy * 0.7; }
        if (b.y > canvas.height - 20) { b.y = canvas.height - 20; b.vy = -b.vy * 0.7; }
    }

    function inregistreazaGol(echipa) {
        if (echipa === 'home') {
            matchState.scoreHome++;
            scoreHomeEl.textContent = matchState.scoreHome;
            goalBanner.textContent = `GOOOL ${matchState.homeTeam.toUpperCase()}!`;
        } else {
            matchState.scoreAway++;
            scoreAwayEl.textContent = matchState.scoreAway;
            goalBanner.textContent = `GOL ${matchState.awayTeam.toUpperCase()}!`;
        }
        goalBanner.classList.remove('hidden');
        matchState.goalCooldown = 95;
    }

    function deseneazaTeren11v11() {
        const w = canvas.width, h = canvas.height;

        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = i % 2 === 0 ? "#15803d" : "#166534";
            ctx.fillRect(i * (w / 10), 0, w / 10, h);
        }

        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 4;
        ctx.strokeRect(22, 20, w - 44, h - 40);

        ctx.beginPath();
        ctx.moveTo(w / 2, 20);
        ctx.lineTo(w / 2, h - 20);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 62, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeRect(22, 135, 130, 270);
        ctx.strokeRect(22, 195, 52, 150);
        ctx.strokeRect(w - 152, 135, 130, 270);
        ctx.strokeRect(w - 74, 195, 52, 150);

        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(6, 205, 16, 130);
        ctx.fillRect(w - 22, 205, 16, 130);
    }

    function deseneazaJucator8Bit(p, isSelected) {
        const isHome = p.team === 'home';
        const [c1, c2] = isHome ? matchState.homeColors : matchState.awayColors;

        if (isSelected) {
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 3;
            ctx.strokeRect(p.x - 11, p.y - 4, 22, 14);

            ctx.fillStyle = "#facc15";
            ctx.fillRect(p.x - 4, p.y - 24, 8, 3);
            ctx.fillRect(p.x - 2, p.y - 21, 4, 3);

            ctx.fillStyle = "#000";
            ctx.fillRect(p.x - 10, p.y + 12, 20, 4);
            ctx.fillStyle = p.stamina > 30 ? "#4ade80" : "#ef4444";
            ctx.fillRect(p.x - 9, p.y + 13, (p.stamina / 100) * 18, 2);
        }

        const offsetSlideX = p.slideTimer > 0 ? p.dirX * 6 : 0;

        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(p.x - 7, p.y + 6, 14, 4);

        ctx.fillStyle = p.rol === 'GK' ? "#22c55e" : c1;
        ctx.fillRect(p.x - 7 + offsetSlideX, p.y - 6, 14, 10);
        ctx.fillStyle = p.rol === 'GK' ? "#000000" : c2;
        ctx.fillRect(p.x - 3 + offsetSlideX, p.y - 6, 6, 10);

        ctx.fillStyle = "#fcd34d";
        ctx.fillRect(p.x - 5, p.y - 14, 10, 8);
        ctx.fillStyle = "#451a03";
        ctx.fillRect(p.x - 5, p.y - 16, 10, 3);
    }

    function deseneazaMinge8Bit(b) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(b.x - 4, b.y + 2, 8, 5);

        const ballY = b.y - b.z;
        const size = 8 + Math.min(4, b.z * 0.15);
        ctx.fillStyle = "#000";
        ctx.fillRect(b.x - size / 2 - 1, ballY - size / 2 - 1, size + 2, size + 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(b.x - size / 2, ballY - size / 2, size, size);
        ctx.fillStyle = "#000";
        ctx.fillRect(b.x - 2, ballY - 2, 3, 3);
    }

    function gameLoop11v11() {
        if (ctx) {
            actualizeazaFizica11v11();
            deseneazaTeren11v11();
            matchState.players.forEach((p, idx) => deseneazaJucator8Bit(p, idx === matchState.activeIdx));
            deseneazaMinge8Bit(matchState.ball);
        }
        requestAnimationFrame(gameLoop11v11);
    }
});
