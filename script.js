document.addEventListener('DOMContentLoaded', () => {
    let dbCategorii = {};
    let dbJucatori = {};
    let mapCategorieOptiune = {}; // Memorează dacă o opțiune e Club, Antrenor sau Trofeu
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

    // Culorile oficiale pentru tricourile echipelor și naționalei
    const CULORI_TRICOURI = {
        "FCSB": ["#dc2626", "#1d4ed8"],
        "Dinamo București": ["#dc2626", "#ffffff"],
        "Rapid București": ["#7f1d1d", "#ffffff"],
        "CFR Cluj": ["#7f1d1d", "#ffffff"],
        "Universitatea Craiova": ["#1d4ed8", "#ffffff"],
        "Farul Constanța": ["#1e3a8a", "#ffffff"],
        "U Cluj": ["#ffffff", "#000000"],
        "Petrolul Ploiești": ["#facc15", "#1d4ed8"],
        "Oțelul Galați": ["#dc2626", "#1e3a8a"],
        "Sepsi OSK": ["#dc2626", "#ffffff"],
        "UTA Arad": ["#dc2626", "#ffffff"],
        "FC Botoșani": ["#dc2626", "#1e3a8a"],
        "Hermannstadt": ["#dc2626", "#000000"],
        "Poli Iași": ["#1d4ed8", "#ffffff"],
        "Poli Timișoara": ["#7e22ce", "#ffffff"],
        "FC Vaslui": ["#facc15", "#15803d"],
        "Unirea Urziceni": ["#1d4ed8", "#ffffff"],
        "Astra Giurgiu": ["#ffffff", "#000000"],
        "Gaz Metan Mediaș": ["#000000", "#ffffff"],
        "FC Argeș": ["#7e22ce", "#ffffff"],
        "România (Naționala Mare)": ["#facc15", "#1d4ed8"],
        "România U21": ["#facc15", "#dc2626"]
    };

    // ==================== GENERATOR PIXEL ART (SVG 8-BIT) ====================

    // 1. Tricou Pixelat (pentru Cluburi & Echipa Națională)
    function svgTricou(numeClub) {
        let [c1, c2] = CULORI_TRICOURI[numeClub] || ["#10b981", "#ffffff"];
        return `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <path d="M4 2h3v2h2V2h3l3 3v3h-3v6H4V8H1V5z" fill="${c1}" />
            <rect x="6" y="4" width="4" height="10" fill="${c2}" />
            <rect x="1" y="5" width="3" height="3" fill="${c2}" />
            <rect x="12" y="5" width="3" height="3" fill="${c2}" />
        </svg>`;
    }

    // 2. Trofeu Pixelat (pentru Competiții, Ligi & Cupe)
    function svgTrofeu() {
        return `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <rect x="4" y="2" width="8" height="6" fill="#facc15" />
            <rect x="2" y="3" width="2" height="3" fill="#eab308" />
            <rect x="12" y="3" width="2" height="3" fill="#eab308" />
            <rect x="6" y="8" width="4" height="3" fill="#eab308" />
            <rect x="4" y="11" width="8" height="2" fill="#facc15" />
            <rect x="3" y="13" width="10" height="2" fill="#78350f" />
        </svg>`;
    }

    // 3. Caracter Masculin Pătrățos (pentru Antrenori și Jucători)
    function svgCaracterMasculin(esteAntrenor = false, culoareTricou = "#ef4444") {
        const culoareHaina = esteAntrenor ? "#1e293b" : culoareTricou; // Costum închis la antrenor
        const cravata = esteAntrenor ? `<rect x="7" y="11" width="2" height="4" fill="#ef4444" />` : '';
        return `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <!-- Păr pătrățos -->
            <rect x="4" y="1" width="8" height="3" fill="#451a03" />
            <!-- Față pătrățoasă -->
            <rect x="4" y="4" width="8" height="6" fill="#fcd34d" />
            <!-- Ochi -->
            <rect x="5" y="6" width="2" height="2" fill="#000000" />
            <rect x="9" y="6" width="2" height="2" fill="#000000" />
            <!-- Mustață / Gură -->
            <rect x="6" y="8" width="4" height="1" fill="#78350f" />
            <!-- Umeri / Tricou sau Costum -->
            <rect x="2" y="10" width="12" height="6" fill="${culoareHaina}" />
            <rect x="6" y="10" width="4" height="2" fill="#ffffff" />
            ${cravata}
        </svg>`;
    }

    // Returnează iconița potrivită în funcție de categorie
    function getIconitaPentruCriteriu(optiune) {
        const cat = mapCategorieOptiune[optiune] || "";
        if (optiune === "România (Naționala Mare)" || optiune === "România U21" || cat.includes("Cluburi")) {
            return svgTricou(optiune);
        }
        if (cat.includes("Antrenori")) {
            return svgCaracterMasculin(true);
        }
        return svgTrofeu();
    }

    // ==================== LOGICA DE JOC ====================

    fetch('jucatori.json')
        .then(res => res.json())
        .then(data => {
            dbCategorii = data.categorii;

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
        .catch(err => console.error("Eroare la citirea jucatori.json:", err));

    function construiesteGrila() {
        board.innerHTML = '<div class="cell header empty">LIGA 1<br>ARCADE</div>';

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

        select.addEventListener('change', () => {
            iconBox.innerHTML = getIconitaPentruCriteriu(select.value);
            actualizeazaIntersectiile();
        });

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

        // Actualizăm iconițele Pixel Art din toate antetele
        document.querySelectorAll('.select-header').forEach(header => {
            const sel = header.querySelector('select');
            const box = header.querySelector('.pixel-icon-box');
            if (sel && box) box.innerHTML = getIconitaPentruCriteriu(sel.value);
        });

        document.querySelectorAll('.grid-cell').forEach(cell => {
            const r = cell.dataset.r;
            const c = cell.dataset.c;
            const c1 = selectsRow[r].value;
            const c2 = selectsCol[c].value;

            cell.dataset.echipa1 = c1;
            cell.dataset.echipa2 = c2;
            cell.className = 'cell grid-cell';

            const nrSolutii = numaraSolutii(c1, c2);
            cell.dataset.solutii = nrSolutii;
            cell.innerHTML = `<span class="possible-count ${nrSolutii === 0 ? 'zero' : ''}">${nrSolutii} SOL.</span>`;
        });

        currentPlayer = 'X';
        statusText.textContent = currentPlayer;
        statusText.className = 'x-color';
    }

    function genereazaGrilaValida() {
        const toateOptiunile = Object.values(dbCategorii).flat();
        const optiuniBogate = toateOptiunile.filter(opt => {
            let aparitii = 0;
            for (const set of Object.values(dbJucatori)) {
                if (set.has(opt)) aparitii++;
            }
            return aparitii >= 12;
        });

        const pool = optiuniBogate.length >= 6 ? optiuniBogate : toateOptiunile;

        for (let incercare = 0; incercare < 250; incercare++) {
            const amestecate = [...pool].sort(() => 0.5 - Math.random());
            const rows = amestecate.slice(0, 3);
            const cols = amestecate.slice(3, 6);

            let ok = true;
            for (const r of rows) {
                for (const c of cols) {
                    if (numaraSolutii(r, c) === 0) { ok = false; break; }
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
        modalSubtitle.textContent = `${cell.dataset.solutii} JUCĂTORI DISPONIBILI`;
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
                <div class="mini-avatar">${svgCaracterMasculin(false, "#10b981")}</div>
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
                <div class="pixel-icon-box">${svgCaracterMasculin(false, culoareEchipament)}</div>
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
            alert(`GREȘIT! ${playerName} nu corespunde. Tura trece la adversar!`);
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
