document.addEventListener('DOMContentLoaded', () => {
    let database = [];
    let uniquePlayers = [];
    let currentPlayer = 'X';
    let activeCell = null;

    const modal = document.getElementById('search-modal');
    const modalTitle = document.getElementById('modal-title');
    const searchInput = document.getElementById('player-search');
    const autocompleteList = document.getElementById('autocomplete-list');
    const closeBtn = document.querySelector('.close-btn');
    const statusText = document.getElementById('jucator-curent');

    // 1. Încărcăm baza de date locală (jucatori.json)
    fetch('jucatori.json')
        .then(res => {
            if (!res.ok) throw new Error("Eroare la încărcarea fișierului JSON.");
            return res.json();
        })
        .then(data => {
            database = data;
            // Generăm o listă unică cu toți jucătorii disponibili pentru sugestii
            const names = data.map(item => item.jucator);
            uniquePlayers = [...new Set(names)].sort();
        })
        .catch(err => console.error("Eroare DB:", err));

    // 2. Gestionare click pe celulele din tabel
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            if (cell.textContent !== "") return; // Celulă deja completată

            activeCell = cell;
            const row = cell.getAttribute('data-row');
            const col = cell.getAttribute('data-col');

            // Deschidem modalul și îl pregătim
            modalTitle.textContent = `Cine a jucat la ${row} și ${col}?`;
            modal.classList.remove('hidden');
            searchInput.value = '';
            autocompleteList.innerHTML = '';
            searchInput.focus();
        });
    });

    // 3. Închidere modal
    const closeModal = () => {
        modal.classList.add('hidden');
        activeCell = null;
    };

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // 4. Autocomplete în timp real
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        autocompleteList.innerHTML = '';

        if (!query) return;

        const matches = uniquePlayers.filter(name => 
            name.toLowerCase().includes(query)
        );

        matches.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            li.addEventListener('click', () => valideazaAlegere(name));
            autocompleteList.appendChild(li);
        });
    });

    // Validare la tasta Enter (dacă scrie numele complet singur)
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
            valideazaAlegere(searchInput.value.trim());
        }
    });

    // 5. Validarea răspunsului ales
    function valideazaAlegere(playerName) {
        if (!activeCell) return;

        const row = activeCell.getAttribute('data-row');
        const col = activeCell.getAttribute('data-col');
        const key1 = `${row}-${col}`;
        const key2 = `${col}-${row}`;

        // Căutăm în JSON dacă există asocierea corectă
        const esteValid = database.some(item => {
            const cheieCorecta = (item.cheie === key1 || item.cheie === key2);
            const jucatorCorect = item.jucator.trim().toLowerCase() === playerName.trim().toLowerCase();
            return cheieCorecta && jucatorCorect;
        });

        if (esteValid) {
            activeCell.textContent = currentPlayer;
            activeCell.classList.add('filled', `${currentPlayer.toLowerCase()}-color`);
            
            // Schimbăm rândul
            currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
            statusText.textContent = currentPlayer;
            statusText.className = `${currentPlayer.toLowerCase()}-color`;

            verificaCastig();
            closeModal();
        } else {
            alert(`Greșit! ${playerName} nu a evoluat la ambele cluburi.`);
            closeModal();
        }
    }

    // 6. Verificare X și O (3 în linie)
    function verificaCastig() {
        const cells = Array.from(document.querySelectorAll('.grid-cell'));
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
                    alert(`Felicitări! Jucătorul ${cells[a].textContent} a câștigat!`);
                    reseteazaJocul();
                }, 100);
                return;
            }
        }

        if (cells.every(c => c.textContent !== "")) {
            setTimeout(() => {
                alert("Remiză!");
                reseteazaJocul();
            }, 100);
        }
    }

    function reseteazaJocul() {
        document.querySelectorAll('.grid-cell').forEach(c => {
            c.textContent = "";
            c.className = "cell grid-cell";
        });
        currentPlayer = 'X';
        statusText.textContent = currentPlayer;
        statusText.className = 'x-color';
    }
});