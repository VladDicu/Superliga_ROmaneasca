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
                for (const
