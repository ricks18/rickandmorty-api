const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const clearButton = document.getElementById('clear-button');
const exportPdfButton = document.getElementById('export-pdf');
const resultsContainer = document.getElementById('results');

// URL da API
const API_URL = 'https://rickandmortyapi.com/api/character';

// Event Listeners
searchButton.addEventListener('click', searchCharacters);
clearButton.addEventListener('click', clearResults);
exportPdfButton.addEventListener('click', exportToPdf);
searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchCharacters();
    }
});

// Função para buscar personagens
async function searchCharacters() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        showMessage('Por favor, digite o nome de um personagem');
        return;
    }
    
    showMessage('Buscando...');
    
    try {
        const response = await fetch(`${API_URL}/?name=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        
        if (data.error) {
            showNoResults();
            return;
        }
        
        displayResults(data.results);
        exportPdfButton.disabled = false;
    } catch (error) {
        showNoResults();
    }
}

// Função para exibir resultados
function displayResults(characters) {
    resultsContainer.innerHTML = '';
    
    if (!characters || characters.length === 0) {
        showNoResults();
        return;
    }
    
    characters.forEach(character => {
        const characterCard = document.createElement('div');
        characterCard.className = 'character-card';
        
        // Determinar a classe de status
        let statusClass = 'status-unknown';
        let statusText = 'Desconhecido';
        
        if (character.status.toLowerCase() === 'alive') {
            statusClass = 'status-alive';
            statusText = 'Vivo';
        } else if (character.status.toLowerCase() === 'dead') {
            statusClass = 'status-dead';
            statusText = 'Morto';
        } else {
            statusText = 'Desconhecido';
        }
        
        // Tradução feita com ajuda da IA
        // Traduzir gênero
        let gender = 'Desconhecido';
        if (character.gender.toLowerCase() === 'male') {
            gender = 'Masculino';
        } else if (character.gender.toLowerCase() === 'female') {
            gender = 'Feminino';
        } else if (character.gender.toLowerCase() === 'genderless') {
            gender = 'Sem gênero';
        }
        
        // Traduzir espécie
        let species = character.species;
        if (character.species.toLowerCase() === 'human') {
            species = 'Humano';
        } else if (character.species.toLowerCase() === 'alien') {
            species = 'Alienígena';
        }
        
        // Criar o elemento card
        const infoHTML = `
            <div class="character-info">
                <h2 class="character-name">${character.name}</h2>
                <div class="character-details">
                    <div class="detail-item">
                        <span class="detail-label">Status:</span> 
                        <span class="${statusClass}">${statusText}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Espécie:</span> 
                        <span>${species}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Gênero:</span> 
                        <span>${gender}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Origem:</span> 
                        <span>${character.origin.name}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Localização:</span> 
                        <span>${character.location.name}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Episódios:</span> 
                        <span>${character.episode.length}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Criar a imagem separadamente para definir atributos especiais
        const img = document.createElement('img');
        img.src = character.image;
        img.alt = character.name;
        img.className = 'character-image';
        img.crossOrigin = 'Anonymous'; // Permite uso da imagem no canvas para o PDF
        
        // Adicionar imagem e info ao card
        characterCard.appendChild(img);
        characterCard.insertAdjacentHTML('beforeend', infoHTML);
        
        resultsContainer.appendChild(characterCard);
    });
}

// Função para mostrar que não há resultados
function showNoResults() {
    resultsContainer.innerHTML = `
        <div class="no-results">
            <p>Nenhum personagem encontrado. Tente outro termo de busca.</p>
        </div>
    `;
    exportPdfButton.disabled = true;
}

// Função para mostrar mensagem
function showMessage(message) {
    resultsContainer.innerHTML = `
        <div class="initial-message">
            <p>${message}</p>
        </div>
    `;
    exportPdfButton.disabled = true;
}

// Função para limpar resultados
function clearResults() {
    searchInput.value = '';
    showMessage('Digite o nome de um personagem para buscar');
    exportPdfButton.disabled = true;
}

// Função para exportar para PDF
function exportToPdf() {
    const element = resultsContainer;
    const options = {
        margin: 1,
        filename: 'personagens-rick-and-morty.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true  // Permite imagens de outros domínios
        },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };
    
    // Adicionar mensagem de que a exportação está em andamento
    const originalContent = element.innerHTML;
    showMessage('Gerando PDF...');
    
    // Pequeno timeout para permitir que a mensagem seja renderizada
    setTimeout(() => {
        // Restaurar conteúdo original
        resultsContainer.innerHTML = originalContent;
        
        // Gerar o PDF
        html2pdf().set(options).from(element).save().then(() => {
            // Mensagem de sucesso após o PDF ser gerado
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = '<p>PDF exportado com sucesso!</p>';
            
            // Anexar mensagem de sucesso temporariamente
            resultsContainer.appendChild(successMessage);
            
            // Remover mensagem de sucesso após um curto período
            setTimeout(() => {
                if (resultsContainer.contains(successMessage)) {
                    resultsContainer.removeChild(successMessage);
                }
            }, 3000);
        });
    }, 500);
} 