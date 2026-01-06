// ===== DADOS DO JOGO =====
const gameData = {
    resources: {
        energy: { value: 1250, production: 45, max: 10000 },
        minerals: { value: 850, production: 32, max: 8000 },
        population: { value: 10250, production: 12, max: 50000 },
        technology: { value: 450, production: 8, max: 10000 },
        food: { value: 5200, production: 25, max: 20000 },
        credits: { value: 12500, production: 18, max: 50000 }
    },
    
    buildings: [
        { id: 'solar', name: 'Usina Solar', icon: 'fas fa-solar-panel', cost: { energy: 0, minerals: 100, credits: 500 }, production: { energy: 50 } },
        { id: 'mine', name: 'Mina', icon: 'fas fa-mountain', cost: { minerals: 0, credits: 800 }, production: { minerals: 40 } },
        { id: 'lab', name: 'Laboratório', icon: 'fas fa-flask', cost: { technology: 0, credits: 1200 }, production: { technology: 15 } },
        { id: 'farm', name: 'Fazenda', icon: 'fas fa-tractor', cost: { food: 0, credits: 600 }, production: { food: 30 } },
        { id: 'habitat', name: 'Habitat', icon: 'fas fa-home', cost: { population: 0, credits: 1000 }, production: { population: 20 } },
        { id: 'bank', name: 'Banco', icon: 'fas fa-university', cost: { credits: 0, minerals: 200 }, production: { credits: 25 } }
    ],
    
    technologies: [
        { id: 'energy1', name: 'Energia Avançada', icon: 'fas fa-atom', description: '+20% produção de energia', cost: 500, requires: [], effect: 'energy' },
        { id: 'mining1', name: 'Mineração Profunda', icon: 'fas fa-digging', description: '+25% produção de minerais', cost: 600, requires: [], effect: 'minerals' },
        { id: 'agriculture1', name: 'Agricultura Hidropônica', icon: 'fas fa-seedling', description: '+30% produção de alimentos', cost: 400, requires: [], effect: 'food' },
        { id: 'ai1', name: 'IA Básica', icon: 'fas fa-robot', description: '+15% produção tecnológica', cost: 800, requires: ['energy1'], effect: 'technology' },
        { id: 'space1', name: 'Foguetes Básicos', icon: 'fas fa-rocket', description: 'Desbloqueia exploração orbital', cost: 1500, requires: ['mining1', 'energy1'], effect: 'phase' },
        { id: 'warp1', name: 'Motor de Dobra', icon: 'fas fa-star', description: 'Viagem interestelar', cost: 3000, requires: ['space1', 'ai1'], effect: 'phase' }
    ],
    
    researchedTechs: [],
    buildingsOnPlanet: [],
    gameTime: 0
};

// ===== ELEMENTOS DO DOM =====
const statusMessage = document.getElementById('statusMessage');
const gameTimeElement = document.getElementById('gameTime');
const constructionArea = document.getElementById('constructionArea');
const buildingsList = document.getElementById('buildingsList');
const upgradeModal = document.getElementById('upgradeModal');
const techModal = document.getElementById('techModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const researchBtn = document.getElementById('researchBtn');

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
    startGameLoop();
    renderBuildingsList();
    renderTechTree();
});

function initializeGame() {
    updateResourceDisplays();
    updateStatus('Bem-vindo ao Planetary Ascension! Comece construindo edifícios e pesquisando tecnologias.');
}

function setupEventListeners() {
    // Cards de recursos
    document.querySelectorAll('.resource-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('card-btn')) {
                openUpgradeModal(card.dataset.resource);
            }
        });
        
        const btn = card.querySelector('.card-btn');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openUpgradeModal(card.dataset.resource);
        });
    });
    
    // Botão de pesquisa
    researchBtn.addEventListener('click', () => {
        techModal.style.display = 'flex';
    });
    
    // Fechar modais
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            upgradeModal.style.display = 'none';
            techModal.style.display = 'none';
        });
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === upgradeModal) upgradeModal.style.display = 'none';
        if (e.target === techModal) techModal.style.display = 'none';
    });
}

// ===== LOOP DO JOGO =====
function startGameLoop() {
    setInterval(() => {
        // Atualizar recursos
        Object.keys(gameData.resources).forEach(resource => {
            const res = gameData.resources[resource];
            res.value = Math.min(res.value + res.production / 10, res.max);
        });
        
        // Atualizar tempo
        gameData.gameTime++;
        updateGameTime();
        
        // Atualizar displays
        updateResourceDisplays();
    }, 100);
}

function updateGameTime() {
    const hours = Math.floor(gameData.gameTime / 3600);
    const minutes = Math.floor((gameData.gameTime % 3600) / 60);
    const seconds = gameData.gameTime % 60;
    
    gameTimeElement.textContent = 
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`;
}

// ===== RECURSOS =====
function updateResourceDisplays() {
    Object.keys(gameData.resources).forEach(resource => {
        const res = gameData.resources[resource];
        const card = document.querySelector(`[data-resource="${resource}"]`);
        
        if (card) {
            card.querySelector('.card-value').innerHTML = 
                `${Math.floor(res.value).toLocaleString()} <span class="unit">${getUnit(resource)}</span>`;
            card.querySelector('.card-production').textContent = `+${res.production}/s`;
        }
    });
}

function getUnit(resource) {
    const units = {
        energy: 'MW',
        minerals: 'kT',
        population: 'hab',
        technology: 'RP',
        food: 't',
        credits: 'CR'
    };
    return units[resource] || '';
}

function updateStatus(message) {
    statusMessage.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
}

// ===== CONSTRUÇÕES =====
function renderBuildingsList() {
    buildingsList.innerHTML = '';
    
    gameData.buildings.forEach(building => {
        const buildingElement = document.createElement('div');
        buildingElement.className = 'building-item';
        buildingElement.draggable = true;
        buildingElement.innerHTML = `
            <i class="${building.icon}"></i>
            <h4>${building.name}</h4>
            <div class="cost">${formatCost(building.cost)}</div>
        `;
        
        buildingElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('building', JSON.stringify(building));
            updateStatus(`Arraste ${building.name} para o planeta`);
        });
        
        buildingsList.appendChild(buildingElement);
    });
}

function formatCost(cost) {
    const parts = [];
    if (cost.energy > 0) parts.push(`${cost.energy} Energia`);
    if (cost.minerals > 0) parts.push(`${cost.minerals} Minerais`);
    if (cost.technology > 0) parts.push(`${cost.technology} Tecnologia`);
    if (cost.food > 0) parts.push(`${cost.food} Alimento`);
    if (cost.population > 0) parts.push(`${cost.population} População`);
    if (cost.credits > 0) parts.push(`${cost.credits} Créditos`);
    return parts.join(', ') || 'Grátis';
}

// Drag & Drop
constructionArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    constructionArea.style.borderColor = '#00d4ff';
});

constructionArea.addEventListener('dragleave', () => {
    constructionArea.style.borderColor = 'transparent';
});

constructionArea.addEventListener('drop', (e) => {
    e.preventDefault();
    constructionArea.style.borderColor = 'transparent';
    
    try {
        const buildingData = JSON.parse(e.dataTransfer.getData('building'));
        placeBuildingOnPlanet(buildingData, e.offsetX, e.offsetY);
    } catch (error) {
        console.error('Erro ao processar construção:', error);
    }
});

function placeBuildingOnPlanet(building, x, y) {
    // Verificar custos
    if (!canAfford(building.cost)) {
        updateStatus(`Recursos insuficientes para construir ${building.name}`);
        return;
    }
    
    // Deduzir custos
    payCost(building.cost);
    
    // Adicionar produção
    Object.keys(building.production).forEach(resource => {
        gameData.resources[resource].production += building.production[resource];
    });
    
    // Criar elemento visual
    const buildingElement = document.createElement('div');
    buildingElement.className = 'building-on-planet';
    buildingElement.style.left = `${x - 40}px`;
    buildingElement.style.top = `${y - 40}px`;
    buildingElement.innerHTML = `
        <i class="${building.icon}"></i>
        <span>${building.name}</span>
    `;
    
    // Tornar arrastável
    buildingElement.draggable = true;
    let isDragging = false;
    let offsetX, offsetY;
    
    buildingElement.addEventListener('mousedown', startDrag);
    buildingElement.addEventListener('touchstart', startDragTouch);
    
    function startDrag(e) {
        isDragging = true;
        const rect = buildingElement.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        buildingElement.style.opacity = '0.8';
        buildingElement.style.zIndex = '100';
    }
    
    function startDragTouch(e) {
        e.preventDefault();
        isDragging = true;
        const touch = e.touches[0];
        const rect = buildingElement.getBoundingClientRect();
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
        document.addEventListener('touchmove', dragTouch);
        document.addEventListener('touchend', stopDrag);
        buildingElement.style.opacity = '0.8';
        buildingElement.style.zIndex = '100';
    }
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        buildingElement.style.left = `${e.clientX - offsetX - constructionArea.getBoundingClientRect().left}px`;
        buildingElement.style.top = `${e.clientY - offsetY - constructionArea.getBoundingClientRect().top}px`;
    }
    
    function dragTouch(e) {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        buildingElement.style.left = `${touch.clientX - offsetX - constructionArea.getBoundingClientRect().left}px`;
        buildingElement.style.top = `${touch.clientY - offsetY - constructionArea.getBoundingClientRect().top}px`;
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', dragTouch);
        buildingElement.style.opacity = '1';
        buildingElement.style.zIndex = '10';
        updateStatus(`${building.name} reposicionado`);
    }
    
    constructionArea.appendChild(buildingElement);
    gameData.buildingsOnPlanet.push({
        ...building,
        element: buildingElement,
        x: x - 40,
        y: y - 40
    });
    
    updateStatus(`${building.name} construído com sucesso!`);
    updateResourceDisplays();
}

function canAfford(cost) {
    return Object.keys(cost).every(resource => 
        gameData.resources[resource]?.value >= cost[resource]
    );
}

function payCost(cost) {
    Object.keys(cost).forEach(resource => {
        if (gameData.resources[resource]) {
            gameData.resources[resource].value -= cost[resource];
        }
    });
}

// ===== UPGRADES =====
function openUpgradeModal(resource) {
    const res = gameData.resources[resource];
    const resourceNames = {
        energy: 'Energia',
        minerals: 'Minerais',
        population: 'População',
        technology: 'Tecnologia',
        food: 'Alimento',
        credits: 'Créditos'
    };
    
    modalTitle.textContent = `UPGRADE - ${resourceNames[resource].toUpperCase()}`;
    
    modalBody.innerHTML = `
        <div class="upgrade-info">
            <div class="resource-display">
                <i class="${getResourceIcon(resource)}"></i>
                <h3>${resourceNames[resource]}</h3>
            </div>
            
            <div class="current-stats">
                <p><strong>Atual:</strong> ${Math.floor(res.value).toLocaleString()} ${getUnit(resource)}</p>
                <p><strong>Produção:</strong> +${res.production}/s</p>
                <p><strong>Capacidade:</strong> ${res.max.toLocaleString()} ${getUnit(resource)}</p>
            </div>
            
            <div class="upgrade-options">
                <h4>Melhorias Disponíveis:</h4>
                
                <div class="upgrade-option">
                    <h5>+10 Produção</h5>
                    <p>Custo: 500 Créditos, 200 Minerais</p>
                    <button class="upgrade-btn" onclick="buyUpgrade('${resource}', 'production', 10, { credits: 500, minerals: 200 })">
                        COMPRAR
                    </button>
                </div>
                
                <div class="upgrade-option">
                    <h5>+1000 Capacidade</h5>
                    <p>Custo: 800 Créditos, 400 Minerais</p>
                    <button class="upgrade-btn" onclick="buyUpgrade('${resource}', 'capacity', 1000, { credits: 800, minerals: 400 })">
                        COMPRAR
                    </button>
                </div>
                
                <div class="upgrade-option">
                    <h5>Eficiência +20%</h5>
                    <p>Custo: 1200 Créditos, 600 Tecnologia</p>
                    <button class="upgrade-btn" onclick="buyUpgrade('${resource}', 'efficiency', 20, { credits: 1200, technology: 600 })">
                        COMPRAR
                    </button>
                </div>
            </div>
        </div>
    `;
    
    upgradeModal.style.display = 'flex';
}

function getResourceIcon(resource) {
    const icons = {
        energy: 'fas fa-bolt',
        minerals: 'fas fa-gem',
        population: 'fas fa-users',
        technology: 'fas fa-flask',
        food: 'fas fa-seedling',
        credits: 'fas fa-coins'
    };
    return icons[resource] || 'fas fa-question';
}

function buyUpgrade(resource, type, amount, cost) {
    if (!canAfford(cost)) {
        updateStatus('Recursos insuficientes para comprar este upgrade!');
        return;
    }
    
    payCost(cost);
    
    const res = gameData.resources[resource];
    switch(type) {
        case 'production':
            res.production += amount;
            updateStatus(`Produção de ${resource} aumentada em +${amount}/s!`);
            break;
        case 'capacity':
            res.max += amount;
            updateStatus(`Capacidade de ${resource} aumentada em +${amount}!`);
            break;
        case 'efficiency':
            res.production = Math.floor(res.production * 1.2);
            updateStatus(`Eficiência de ${resource} aumentada em 20%!`);
            break;
    }
    
    updateResourceDisplays();
    upgradeModal.style.display = 'none';
}

// ===== TECNOLOGIAS =====
function renderTechTree() {
    const techTree = document.querySelector('.tech-tree');
    techTree.innerHTML = '';
    
    gameData.technologies.forEach(tech => {
        const techElement = document.createElement('div');
        const isResearched = gameData.researchedTechs.includes(tech.id);
        const canResearch = canResearchTech(tech) && !isResearched;
        
        techElement.className = `tech-node ${isResearched ? 'researched' : ''} ${!canResearch && !isResearched ? 'locked' : ''}`;
        techElement.innerHTML = `
            <div class="tech-icon">
                <i class="${tech.icon}"></i>
            </div>
            <h3>${tech.name}</h3>
            <p>${tech.description}</p>
            <div class="tech-cost">
                <span>${tech.cost} RP</span>
            </div>
        `;
        
        if (canResearch && !isResearched) {
            techElement.addEventListener('click', () => researchTechnology(tech));
        }
        
        techTree.appendChild(techElement);
    });
}

function canResearchTech(tech) {
    // Verificar recursos
    if (gameData.resources.technology.value < tech.cost) return false;
    
    // Verificar pré-requisitos
    return tech.requires.every(req => gameData.researchedTechs.includes(req));
}

function researchTechnology(tech) {
    if (gameData.resources.technology.value < tech.cost) {
        updateStatus(`Tecnologia insuficiente para pesquisar ${tech.name}!`);
        return;
    }
    
    if (!canResearchTech(tech)) {
        updateStatus(`Pré-requisitos não atendidos para ${tech.name}!`);
        return;
    }
    
    gameData.resources.technology.value -= tech.cost;
    gameData.researchedTechs.push(tech.id);
    
    // Aplicar efeitos
    applyTechEffect(tech);
    
    updateStatus(`${tech.name} pesquisada com sucesso!`);
    updateResourceDisplays();
    renderTechTree();
    techModal.style.display = 'none';
}

function applyTechEffect(tech) {
    switch(tech.effect) {
        case 'energy':
            gameData.resources.energy.production = Math.floor(gameData.resources.energy.production * 1.2);
            break;
        case 'minerals':
            gameData.resources.minerals.production = Math.floor(gameData.resources.minerals.production * 1.25);
            break;
        case 'food':
            gameData.resources.food.production = Math.floor(gameData.resources.food.production * 1.3);
            break;
        case 'technology':
            gameData.resources.technology.production = Math.floor(gameData.resources.technology.production * 1.15);
            break;
        case 'phase':
            updateStatus(`Fase avançada desbloqueada: ${tech.name}!`);
            break;
    }
}

// ===== ESTILOS DINÂMICOS PARA MODAL =====
const style = document.createElement('style');
style.textContent = `
    .upgrade-info {
        display: flex;
        flex-direction: column;
        gap: 25px;
    }
    
    .resource-display {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 20px;
        background: rgba(16, 20, 31, 0.8);
        border-radius: 15px;
        border: 1px solid rgba(0, 212, 255, 0.2);
    }
    
    .resource-display i {
        font-size: 3rem;
        color: #00d4ff;
    }
    
    .resource-display h3 {
        font-size: 2rem;
        color: #ffffff;
        font-family: 'Orbitron', sans-serif;
    }
    
    .current-stats {
        background: rgba(26, 26, 46, 0.8);
        padding: 20px;
        border-radius: 15px;
        border: 1px solid rgba(138, 43, 226, 0.2);
    }
    
    .current-stats p {
        font-size: 1.2rem;
        margin-bottom: 10px;
        color: #e6f1ff;
    }
    
    .current-stats strong {
        color: #00d4ff;
    }
    
    .upgrade-options {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .upgrade-options h4 {
        color: #8a2be2;
        font-size: 1.4rem;
        font-family: 'Orbitron', sans-serif;
    }
    
    .upgrade-option {
        background: rgba(16, 20, 31, 0.8);
        padding: 20px;
        border-radius: 15px;
        border: 1px solid rgba(0, 212, 255, 0.1);
        transition: all 0.3s ease;
    }
    
    .upgrade-option:hover {
        border-color: #8a2be2;
        transform: translateY(-3px);
    }
    
    .upgrade-option h5 {
        color: #ffffff;
        font-size: 1.3rem;
        margin-bottom: 10px;
        font-family: 'Orbitron', sans-serif;
    }
    
    .upgrade-option p {
        color: #a0aec0;
        margin-bottom: 15px;
        font-size: 1rem;
    }
    
    .upgrade-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(90deg, #8a2be2, #00d4ff);
        border: none;
        border-radius: 10px;
        color: white;
        font-family: 'Orbitron', sans-serif;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        letter-spacing: 0.5px;
        font-size: 1.1rem;
    }
    
    .upgrade-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(138, 43, 226, 0.4);
    }
`;
document.head.appendChild(style);