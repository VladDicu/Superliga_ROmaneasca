document.addEventListener('DOMContentLoaded', () => {
    let dbEchipe = [];
    let dbJucatori = {};
    let currentPlayer = 'X';
    let activeCell = null;
    let gameOver = false;
    let usedPlayers = new Set();
    let matches = [];
    let activeIndex = -1;

    const board = document.getElementById('game-board');
    const modal = document.getElementById('search-modal');
    const searchInput = document.getElementById('player-search');
    const autocompleteList = document.getElementById('autocomplete-list');
    const statusText = document.getElementById('jucator-curent');
    const statusBox = document.getElementById('status-joc');
    const closeBtn = document.querySelector('.close-btn');
    const toastEl = document.getElementById('toast');

    const COMBINATII = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // Ignoră diacriticele și majusculele: "Stanciu" găsește și "Ștefan"
    const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    // ---------- Utilitare ----------
    let toastTimer;
    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
    }

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // ---------- 1. Încărcare date ----------
    fetch('jucatori.json')
        .then(res => {
            if (!res.ok) throw new Error(res.status);
            return res.json();
        })
        .then(data => {
            dbEchipe = [...data.echipe].sort((a, b) => a.localeCompare(b, 'ro'));
            dbJucatori = data.jucatori;
            construiesteGrila();
        })
        .catch(err => {
            console.error('Eroare la încărcarea bazei de date:', err);
            board.innerHTML = '<p style="grid-column:1/-1;padding:20px;text-align:center">' +
                'Nu am putut încărca jucatori.json. Deschide pagina printr-un server local ' +
                '(de ex. Live Server în VS Code), nu direct din fișier.</p>';
        });

    // ---------- 2. Construire grilă ----------
    function construiesteGrila(preselectate) {
        board.innerHTML = '<div class="cell header empty"></div>';
        const alese = preselectate || dbEchipe.slice(0, 6);

        for (let i = 0; i < 3; i++) board.appendChild(creazaSelector('col', i, alese[i]));

        for (let r = 0; r < 3; r++) {
            board.appendChild(creazaSelector('row', r, alese[r + 3]));
            for (let c = 0; c < 3; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell grid-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.tabIndex = 0;
                cell.setAttribute('role', 'button');
                cell.addEventListener('click', () => deschideModal(cell));
                cell.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        deschideModal(cell);
                    }
                });
                board.appendChild(cell);
            }
        }
        actualizeazaOptiuni();
        reseteazaJoc();
    }

    function creazaSelector(tip, index, valoare) {
        const wrapper = document.createElement('div');
        wrapper.className = 'cell header select-header';

        const select = document.createElement('select');
        select.dataset.tip = tip;
        select.setAttribute('aria-label', `Echipa ${tip === 'col' ? 'coloana' : 'rândul'} ${index + 1}`);

        dbEchipe.forEach(echipa => {
            const opt = document.createElement('option');
            opt.value = opt.textContent = echipa;
            if (echipa === valoare) opt.selected = true;
            select.appendChild(opt);
        });

        select.addEventListener('change', () => {
            actualizeazaOptiuni();
            reseteazaJoc(); // o echipă nouă schimbă regulile, deci începem de la zero
        });
        wrapper.appendChild(select);
        return wrapper;
    }

    // Dezactivează în fiecare dropdown echipele deja alese în celelalte cinci
    function actualizeazaOptiuni() {
        const selects = [...document.querySelectorAll('.select-header select')];
        const alese = new Set(selects.map(s => s.value));
        selects.forEach(s => {
            [...s.options].forEach(o => {
                o.disabled = alese.has(o.value) && o.value !== s.value;
            });
        });
    }

    function citesteTabla() {
        const rows = [...document.querySelectorAll('select[data-tip="row"]')].map(s => s.value);
        const cols = [...document.querySelectorAll('select[data-tip="col"]')].map(s => s.value);
        return { rows, cols };
    }

    // ---------- 3. Joc nou ----------
    function reseteazaJoc() {
        const { rows, cols } = citesteTabla();
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.className = 'cell grid-cell';
            cell.innerHTML = '';
            delete cell.dataset.owner;
            cell.dataset.echipa1 = rows[cell.dataset.r];
            cell.dataset.echipa2 = cols[cell.dataset.c];
            cell.setAttribute('aria-label', `${rows[cell.dataset.r]} și ${cols[cell.dataset.c]}`);
        });
        usedPlayers.clear();
        gameOver = false;
        currentPlayer = 'X';
        actualizeazaStatus();
    }

    function actualizeazaStatus() {
        statusBox.innerHTML = `Rândul lui <span id="jucator-curent" class="${currentPlayer.toLowerCase()}-color">${currentPlayer}</span>`;
    }

    document.getElementById('btn-reset').addEventListener('click', reseteazaJoc);

    document.getElementById('btn-shuffle').addEventListener('click', () => {
        // Alege 6 echipe care au cel puțin un jucător comun pentru fiecare celulă ar fi ideal,
        // dar aici păstrăm simplu: 6 echipe aleatoare.
        construiesteGrila(shuffle(dbEchipe).slice(0, 6));
    });

    // ---------- 4. Modal & autocomplete ----------
    function deschideModal(cell) {
        if (gameOver || cell.dataset.owner) return;
        activeCell = cell;
        document.getElementById('modal-title').textContent =
            `Cine a jucat la ${cell.dataset.echipa1} și ${cell.dataset.echipa2}?`;
        modal.classList.remove('hidden');
        searchInput.value = '';
        randeazaSugestii();
        searchInput.focus();
    }

    function inchideModal() {
        modal.classList.add('hidden');
        if (activeCell) activeCell.focus();
    }

    closeBtn.addEventListener('click', inchideModal);
    modal.addEventListener('click', e => { if (e.target === modal) inchideModal(); });

    function randeazaSugestii() {
        const query = normalize(searchInput.value.trim());
        autocompleteList.innerHTML = '';
        matches = [];
        activeIndex = -1;
        if (!query) return;

        matches = Object.keys(dbJucatori)
            .filter(nume => normalize(nume).includes(query))
            // rezultatele care încep cu textul căutat apar primele
            .sort((a, b) => {
                const sa = normalize(a).startsWith(query) ? 0 : 1;
                const sb = normalize(b).startsWith(query) ? 0 : 1;
                return sa - sb || a.localeCompare(b, 'ro');
            })
            .slice(0, 8);

        if (!matches.length) {
            const li = document.createElement('li');
            li.className = 'empty';
            li.textContent = 'Niciun jucător găsit';
            autocompleteList.appendChild(li);
            return;
        }

        matches.forEach(nume => {
            const li = document.createElement('li');
            li.textContent = nume;
            if (usedPlayers.has(nume)) {
                li.classList.add('used');
                li.title = 'Jucător deja folosit';
            } else {
                li.addEventListener('click', () => valideazaAlegere(nume));
            }
            autocompleteList.appendChild(li);
        });
    }

    function seteazaActiv(i) {
        const items = autocompleteList.querySelectorAll('li');
        if (!items.length || !matches.length) return;
        activeIndex = (i + items.length) % items.length;
        items.forEach((li, idx) => li.classList.toggle('active', idx === activeIndex));
        items[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    searchInput.addEventListener('input', randeazaSugestii);

    searchInput.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); seteazaActiv(activeIndex + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); seteazaActiv(activeIndex - 1); }
        else if (e.key === 'Enter') {
            const nume = matches[activeIndex >= 0 ? activeIndex : 0];
            if (nume && !usedPlayers.has(nume)) valideazaAlegere(nume);
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) inchideModal();
    });

    // ---------- 5. Validare ----------
    function valideazaAlegere(playerName) {
        const club1 = activeCell.dataset.echipa1;
        const club2 = activeCell.dataset.echipa2;
        const istoric = dbJucatori[playerName] || [];
        const cell = activeCell;

        modal.classList.add('hidden');

        if (istoric.includes(club1) && istoric.includes(club2)) {
            cell.dataset.owner = currentPlayer;
            cell.classList.add('filled', `${currentPlayer.toLowerCase()}-color`);
            cell.innerHTML = `<span>${currentPlayer}</span><span class="who"></span>`;
            cell.querySelector('.who').textContent = playerName;
            usedPlayers.add(playerName);

            if (!verificaFinal()) {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                actualizeazaStatus();
            }
        } else {
            toast(`${playerName} nu a jucat la ${club1} și la ${club2}.`);
            cell.classList.remove('shake');
            void cell.offsetWidth; // repornește animația
            cell.classList.add('shake');
            cell.focus();
        }
    }

    // ---------- 6. Victorie sau remiză ----------
    function verificaFinal() {
        const cells = [...document.querySelectorAll('.grid-cell')];
        const owner = i => cells[i].dataset.owner;

        for (const [a, b, c] of COMBINATII) {
            if (owner(a) && owner(a) === owner(b) && owner(a) === owner(c)) {
                [a, b, c].forEach(i => cells[i].classList.add('win'));
                gameOver = true;
                const castigator = owner(a);
                statusBox.innerHTML = `<span class="${castigator.toLowerCase()}-color">${castigator}</span> a câștigat!`;
                toast(`Felicitări, ${castigator}! Apasă „Joc nou” pentru o altă rundă.`);
                return true;
            }
        }

        if (cells.every(c => c.dataset.owner)) {
            gameOver = true;
            statusBox.textContent = 'Remiză';
            toast('Remiză. Apasă „Joc nou” ca să încerci din nou.');
            return true;
        }
        return false;
    }
});
