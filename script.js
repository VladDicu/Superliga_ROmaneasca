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

    // Hash numeric din numele persoanei pentru a genera fețe/tricouri diversificate
    function hashString(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = (h * 31 + str.charCodeAt(i)) >>> 0;
        }
        return h;
    }

    // Antrenori principali faimoși (pentru a filtra secunzii / preparatorii fizici din Transfermarkt)
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
        "Dušan Uhrin Jr.", "Oleg Protasov", "Walter Zenga", "Cristiano Bergodi",
        "Mirel Rădoi", "Adrian Mutu", "Cristian Chivu", "Nicolae Dică",
        "Ilie Stan", "Tibor Selymes", "Gheorghe Mulțescu", "Grigore Sichitiu",
        "romulus gabor", "Aurel Țicleanu", "Ilie Balaci", "Cornel Dinu"
    ]);

    // Echipamentele cluburilor: [Culoare1, Culoare2, Model ('stripes', 'split', 'sleeves', 'hoops')]
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
        "FC Botoșani": ["#dc2626", "#1d4ed8", "stripes"],
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

    // ==================== GENERATOR DIVERSIFICAT PIXEL ART (SVG) ====================

    // 1. Tricou Pixelat cu 4 modele diferite (dungi, jumătăți, mâneci, inele)
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
            patternSVG = `
                <rect x="5" y="3" width="2" height="11" fill="${c2}" />
                <rect x="9" y="3" width="2" height="11" fill="${c2}" />
            `;
        } else if (model === 'split') {
            patternSVG = `<rect x="8" y="3" width="4" height="11" fill="${c2}" />`;
        } else if (model === 'hoops') {
            patternSVG = `
                <rect x="4" y="5" width="8" height="2" fill="${c2}" />
                <rect x="4" y="9" width="8" height="2" fill="${c2}" />
            `;
        } else {
            patternSVG = `
                <rect x="1" y="4" width="3" height="4" fill="${c2}" />
                <rect x="12" y="4" width="3" height="4" fill="${c2}" />
            `;
        }

        return `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <!-- Contur negru 8-bit -->
            <path d="M3 1h10l3 3v5h-3v6H3V9H0V4z" fill="#000000" />
            <!-- Baza tricoului -->
            <path d="M4 2h3v2h2V2h3l3 3v3h-3v6H4V8H1V5z" fill="${c1}" />
            ${patternSVG}
            <!-- Guler -->
            <rect x="6" y="2" width="4" height="2" fill="${c2}" />
        </svg>`;
    }

    // 2. Trofeu Pixelat diversificat în funcție de competiție
    function svgTrofeu(numeTrofeu) {
        const t = numeTrofeu.toLowerCase();
        // Trofeu argintiu cu "urechi" pentru UCL / Europa
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
        // Gheata de aur / minge aurie pentru Golgheter
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
        // Cupă aurie clasică (Titlu / Cupa României / Mondial / EURO)
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

    // 3. Caracter Masculin 8-bit generat procedural după nume (frizuri, culori păr, barbă, costum/echipament)
    function svgCaracterMasculin(numePersoana, esteAntrenor = false, culoareEchipament = null) {
        const h = hashString(numePersoana || "Jucator");
        const nuantePiele = ["#fde68a", "#fcd34d", "#fbbf24", "#f59e0b"];
        const culoriPar = ["#090d16", "#451a03", "#78350f", "#92400e", "#d97706", "#64748b"];
        const culoriCostum = ["#1e293b", "#0f172a", "#334155", "#1e3a8a", "#3f3f46"];
        const culoriCravata = ["#ef4444", "#eab308", "#3b82f6", "#10b981"];

        const piele = nuantePiele[h % nuantePiele.length];
        const par = culoriPar[(h >> 2) % culoriPar.length];
        const tipFrizura = (h >> 4) % 4; // 0: clasic, 1: tuns scurt, 2: freză, 3: chel/rar
        const areBarba = ((h >> 6) % 3) === 0;

        const haina = esteAntrenor 
            ? culoriCostum[(h >> 3) % culoriCostum.length] 
            : (culoareEchipament || "#ef4444");
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
            ? `<rect x="2" y="10" width="12" height="6" fill="${haina}" />
               <rect x="6" y="10" width="4" height="3" fill="#ffffff" />
               <rect x="7" y="11" width="2" height="5" fill="${cravata}" />`
            : `<rect x="2" y="10" width="12" height="6" fill="${haina}" />
               <rect x="5" y="10" width="6" height="2" fill="#ffffff" />
               <rect x="7" y="12" width="2" height="4" fill="#ffffff" />`;

        return `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <!-- Contur cap -->
            <rect x="3" y="3" width="10" height="7" fill="#000000" />
            <!-- Față -->
            <rect x="4" y="4" width="8" height="6" fill="${piele}" />
            ${parSVG}
            <!-- Ochi -->
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

    // ==================== ÎNCĂRCARE BAZĂ DE DATE ====================
    fetch('jucatori.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            dbCategorii = data.categorii;

            // Filtrăm antrenorii din dropdown ca să păstrăm doar antrenorii principali cunoscuți
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

        // Actualizăm iconița Pixel Art și eticheta colorată din fiecare header
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

    // ==================== GENERATOR DE GRILĂ DIVERSIFICATĂ ====================
    // Garantăm un mix de Cluburi + Trofee + Antrenori + Competiții (nu 6 antrenori la fel!)
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
            // Pe rânduri punem 2 Cluburi + 1 Antrenor (sau Trofeu)
            // Pe coloane punem 2 Cluburi + 1 Trofeu/Competiție
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
});
