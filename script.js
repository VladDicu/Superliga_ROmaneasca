document.addEventListener('DOMContentLoaded', () => {
    let dbEchipe = [];
    let dbJucatori = {};
    let currentPlayer = 'X';
    let activeCell = null;

    // Referințe DOM
    const board = document.getElementById('game-board');
    const modal = document.getElementById('search-modal');
    const searchInput = document.getElementById('player-search');
    const autocompleteList = document.getElementById('autocomplete-list');
    const statusText = document.getElementById('jucator-curent');
    const closeBtn = document.querySelector('.close-btn');

    // 1. Încărcarea datelor în noul format
    fetch('jucatori.json')
        .then(res => res.json())
        .then(data => {
            dbEchipe = data.echipe.sort();
            dbJucatori = data.jucatori;
            construiesteGrila();
        })
        .catch(err => console.error("Eroare la procesarea bazei de date:", err));

    // 2. Construirea dinamică a grilei cu selectori de echipe
    function construiesteGrila() {
        board.innerHTML = '<div class="cell header empty"></div>';
        
        // Creăm capetele de coloană (dropdown-uri)
        for (let i = 0; i < 3; i++) {
            board.appendChild(creazaSelector('col', i));
        }

        // Creăm capetele de rând și celulele de joc
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
        actualizeazaIntersectiile();
    }

    // Helper pentru a genera meniurile <select>
    function creazaSelector(tip, index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'cell header select-header';
        
        const select = document.createElement('select');
        select.dataset.tip = tip;
        
        dbEchipe.forEach((echipa, i) => {
            const opt = document.createElement('option');
            opt.value = echipa;
            opt.textContent = echipa;
            // Populăm inițial cu echipe diferite pentru a evita dublurile pe axe
            if (tip === 'col' && i === index) opt.selected = true;
            if (tip === 'row' && i === index + 3) opt.selected = true;
            select.appendChild(opt);
        });

        // Când jucătorul schimbă echipa, reactualizăm coordonatele celulelor
        select.addEventListener('change', actualizeazaIntersectiile);
        wrapper.appendChild(select);
        return wrapper;
    }

    // 3. Maparea echipelor pe celulele de joc
    function actualizeazaIntersectiile() {
        const selectsRow = document.querySelectorAll('select[data-tip="row"]');
        const selectsCol = document.querySelectorAll('select[data-tip="col"]');
        
        document.querySelectorAll('.grid-cell').forEach(cell => {
            const r = cell.dataset.r;
            const c = cell.dataset.c;
            cell.dataset.echipa1 = selectsRow[r].value;
            cell.dataset.echipa2 = selectsCol[c].value;
            
            // Golim celulele automat dacă s-a modificat un club de pe margine
            if(cell.textContent) {
                cell.textContent = "";
                cell.className = 'cell grid-cell';
            }
        });
    }

    // 4. Modal & Autocomplete inteligent
    function deschideModal(cell) {
        if (cell.textContent !== "") return;
        
        activeCell = cell;
        document.getElementById('modal-title').textContent = 
            `Cine a jucat la ${cell.dataset.echipa1} și ${cell.dataset.echipa2}?`;
        
        modal.classList.remove('hidden');
        searchInput.value = '';
        autocompleteList.innerHTML = '';
        searchInput.focus();
    }

    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        autocompleteList.innerHTML = '';
        
        if (!query) return;

        // Căutăm direct în cheile obiectului "jucatori"
        const jucatoriDisponibili = Object.keys(dbJucatori);
        const matches = jucatoriDisponibili
            .filter(nume => nume.toLowerCase().includes(query))
            .slice(0, 6); // Limităm la 6 sugestii pentru o interfață curată

        matches.forEach(nume => {
            const li = document.createElement('li');
            li.textContent = nume;
            li.addEventListener('click', () => valideazaAlegere(nume));
            autocompleteList.appendChild(li);
        });
    });

    // 5. Noul sistem de validare ML/Graph-based
    function valideazaAlegere(playerName) {
        const club1 = activeCell.dataset.echipa1;
        const club2 = activeCell.dataset.echipa2;
        const istoricCluburi = dbJucatori[playerName] || [];

        // Condiția principală: jucătorul trebuie să aibă ambele cluburi în array-ul carierei sale
        if (istoricCluburi.includes(club1) && istoricCluburi.includes(club2)) {
            activeCell.textContent = currentPlayer;
            activeCell.classList.add('filled', `${currentPlayer.toLowerCase()}-color`);
            
            // Trecem la următorul jucător
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            statusText.textContent = currentPlayer;
            statusText.className = `${currentPlayer.toLowerCase()}-color`;
            
            verificaCastig();
        } else {
            alert(`Eroare de istoric! ${playerName} nu a evoluat la ambele cluburi.`);
        }
        
        modal.classList.add('hidden');
    }

    // 6. Motorul pentru condiția de victorie
    function verificaCastig() {
        const cells = Array.from(document.querySelectorAll('.grid-cell'));
        if (cells.length < 9) return;
        
        const combinatii = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Orizontale
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticale
            [0, 4, 8], [2, 4, 6]             // Diagonale
        ];

        for (const [a, b, c] of combinatii) {
            if (cells[a].textContent && 
                cells[a].textContent === cells[b].textContent && 
                cells[a].textContent === cells[c].textContent) {
                
                setTimeout(() => {
                    alert(`Joc încheiat! Câștigător: ${cells[a].textContent}`);
                    // Poți apela o funcție de reset aici
                }, 100);
                return;
            }
        }
    }
});