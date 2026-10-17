document.addEventListener('DOMContentLoaded', () => {
    let dbCategorii = {};
    let dbJucatori = {}; // Nume -> Set cu toate tag-urile jucătorului
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

    // Funcție care elimină diacriticele pentru o căutare prietenoasă
    const normalizeText = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // 1. Încărcăm jucatori.json
    fetch('jucatori.json')
        .then(res => {
            if (!res.ok) throw new Error("Nu am găsit jucatori.json! Pornește cu Live Server.");
            return res.json();
        })
        .then(data => {
            dbCategorii = data.categorii;

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
            genereazaGrilaValida(); // Pornim direct cu o grilă 100% rezolvabilă
        })
        .catch(err => console.error("Eroare DB:", err));

    // 2. Construirea grilei 4x4
    function construiesteGrila() {
        board.innerHTML = '<div class="cell header empty">⚽</div>';

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

        const select = document.createElement('select');
        select.dataset.tip = tip;
        select.dataset.index = index;

        for (const [numeCat, optiuni] of Object.entries(dbCategorii)) {
            if (!optiuni || optiuni.length === 0) continue;
            const optgroup = document.createElement('optgroup');
            optgroup.label = `── ${numeCat} ──`;

            optiuni.forEach(optiune => {
                const opt = document.createElement('option');
                opt.value = optiune;
                opt.textContent = optiune;
                optgroup.appendChild(opt);
            });
            select.appendChild(optgroup);
        }

        select.addEventListener('change', actualizeazaIntersectiile);
        wrapper.appendChild(select);
        return wrapper;
    }

    // 3. Calculăm câți jucători corespund fiecărei intersecții
    function numaraSolutii(criteriu1, criteriu2) {
        if (criteriu1 === criteriu2) return 0;
        let count = 0;
        for (const tagSet of Object.values(dbJucatori)) {
            if (tagSet.has(criteriu1) && tagSet.has(criteriu2)) {
                count++;
            }
        }
        return count;
    }

    // 4. Actualizarea intersecțiilor când se schimbă un dropdown
    function actualizeazaIntersectiile() {
        const selectsRow = document.querySelectorAll('select[data-tip="row"]');
        const selectsCol = document.querySelectorAll('select[data-tip="col"]');
        usedPlayers.clear();

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
            cell.innerHTML = `<span class="possible-count ${nrSolutii === 0 ? 'zero' : ''}">${nrSolutii} sol.</span>`;
        });

        currentPlayer = 'X';
        statusText.textContent = currentPlayer;
        statusText.className = 'x-color';
    }

    // 5. Generator inteligent de grilă fără căsuțe imposibile (0 soluții)
    function genereazaGrilaValida() {
        const toateOptiunile = Object.values(dbCategorii).flat();
        if (toateOptiunile.length < 6) return;

        // Filtru: luăm doar opțiunile care au suficienți jucători în DB
        const optiuniBogate = toateOptiunile.filter(opt => {
            let aparitii = 0;
            for (const set of Object.values(dbJucatori)) {
                if (set.has(opt)) aparitii++;
            }
            return aparitii >= 8;
        });

        const pool = optiuniBogate.length >= 6 ? optiuniBogate : toateOptiunile;

        for (let incercare = 0; incercare < 200; incercare++) {
            const amestecate = [...pool].sort(() => 0.5 - Math.random());
            const rows = amestecate.slice(0, 3);
            const cols = amestecate.slice(3, 6);

            let grilaValida = true;
            for (const r of rows) {
                for (const c of cols) {
                    if (numaraSolutii(r, c) === 0) {
                        grilaValida = false;
                        break;
                    }
                }
                if (!grilaValida) break;
            }

            if (grilaValida) {
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

    // 6. Deschidere Modal & Căutare fără diacritice
    function deschideModal(cell) {
        if (cell.classList.contains('filled')) return;

        activeCell = cell;
        const c1 = cell.dataset.echipa1;
        const c2 = cell.dataset.echipa2;
        const sol = cell.dataset.solutii;

        modalTitle.textContent = `${c1} × ${c2}`;
        modalSubtitle.textContent = `${sol} jucători posibili în baza de date`;
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
            li.textContent = nume;
            li.addEventListener('click', () => valideazaAlegere(nume));
            autocompleteList.appendChild(li);
        });
    });

    // 7. Validarea alegerii
    function valideazaAlegere(playerName) {
        if (!activeCell) return;

        const c1 = activeCell.dataset.echipa1;
        const c2 = activeCell.dataset.echipa2;
        const taguri = dbJucatori[playerName];

        if (taguri && taguri.has(c1) && taguri.has(c2)) {
            usedPlayers.add(playerName);
            activeCell.innerHTML = `
                <div class="winner-mark ${currentPlayer.toLowerCase()}-color">${currentPlayer}</div>
                <div class="player-name-tag" title="${playerName}">${playerName}</div>
            `;
            activeCell.classList.add('filled');

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusText.textContent = currentPlayer;
            statusText.className = `${currentPlayer.toLowerCase()}-color`;

            modal.classList.add('hidden');
            verificaCastig();
        } else {
            alert(`Greșit! ${playerName} nu are simultan în palmares "${c1}" și "${c2}". Rândul trece la adversar!`);
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusText.textContent = currentPlayer;
            statusText.className = `${currentPlayer.toLowerCase()}-color`;
            modal.classList.add('hidden');
        }
    }

    // 8. Verificare câștigător
    function verificaCastig() {
        const cells = Array.from(document.querySelectorAll('.grid-cell'));
        const getMark = (cell) => {
            const mark = cell.querySelector('.winner-mark');
            return mark ? mark.textContent : '';
        };

        const linii = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const [a, b, c] of linii) {
            const mA = getMark(cells[a]);
            if (mA && mA === getMark(cells[b]) && mA === getMark(cells[c])) {
                setTimeout(() => alert(`Victorie pentru jucătorul ${mA}!`), 150);
                return;
            }
        }

        if (cells.every(cell => cell.classList.contains('filled'))) {
            setTimeout(() => alert("Remiză! Toate căsuțele au fost completate."), 150);
        }
    }
});
