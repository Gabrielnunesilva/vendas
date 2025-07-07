let precos = {};
let quantidades = {};

const container = document.querySelector('.container');
let historico = JSON.parse(localStorage.getItem('historico')) || [];


const dadosSalvos = localStorage.getItem('produtos');
if (dadosSalvos) {
    precos = JSON.parse(dadosSalvos);
} else {
    precos = { acai: 10, lanche: 10, suco: 2 };
}
for (let produto in precos) {
    quantidades[produto] = 0;
}
atualizarInterface();

// -----------------------------
// Lógica da calculadora
// -----------------------------
function alterarQtd(produto, delta) {
    quantidades[produto] = Math.max(0, (quantidades[produto] || 0) + delta);
    document.getElementById('qtd-' + produto).textContent = quantidades[produto];
    atualizarTotal();
}

function atualizarTotal() {
    let total = 0;
    for (let produto in quantidades) {
        total += quantidades[produto] * precos[produto];
    }
    document.getElementById('total').textContent = total.toFixed(2).replace('.', ',');
}

function resetar() {
    for (let produto in quantidades) {
        quantidades[produto] = 0;
        document.getElementById('qtd-' + produto).textContent = 0;
    }
    atualizarTotal();
}

// -----------------------------
// Atualizar interface com os produtos
// -----------------------------
function atualizarInterface() {
    // Remove produtos antigos
    document.querySelectorAll('.produto').forEach(p => p.remove());

    const totalDiv = document.querySelector('.total');

    for (let produto in precos) {
        const div = document.createElement('div');
        div.className = 'produto';
        div.innerHTML = `
            <div class="produto-nome">${produto} (R$${precos[produto]}):</div>
            <div class="controles">
                <button onclick="alterarQtd('${produto}', -1)">-</button>
                <span id="qtd-${produto}">0</span>
                <button onclick="alterarQtd('${produto}', 1)">+</button>
            </div>
        `;
        container.insertBefore(div, totalDiv);
    }

    atualizarTotal();
}

// -----------------------------
// Modal de Configurações
// -----------------------------
document.getElementById('config-btn').onclick = () => abrirModal();

function abrirModal() {
    document.getElementById('config-modal').classList.remove('hidden');
    gerarFormularioConfiguracao();
}

function fecharModal() {
    document.getElementById('config-modal').classList.add('hidden');
}

function gerarFormularioConfiguracao() {
    const form = document.getElementById('config-form');
    form.innerHTML = '';
    for (let produto in precos) {
        form.appendChild(criarCampo(produto, precos[produto]));
    }
}

function criarCampo(nome, preco) {
    const div = document.createElement('div');
    div.innerHTML = `
        <input type="text" class="nome-produto" placeholder="Nome" value="${nome}">
        <input type="number" class="preco-produto" placeholder="Preço" value="${preco}" min="0" step="0.01">
        <button class="botao-remover" onclick="this.parentElement.remove()">❌</button>
    `;
    return div;
}


document.getElementById('add-produto').onclick = () => {
    const form = document.getElementById('config-form');
    form.appendChild(criarCampo('', ''));
};

function salvarConfiguracoes() {
    const nomes = document.querySelectorAll('.nome-produto');
    const precosInputs = document.querySelectorAll('.preco-produto');

    const novosPrecos = {};
    const novasQuantidades = {};

    for (let i = 0; i < nomes.length; i++) {
        const nome = nomes[i].value.trim();
        let preco = parseFloat(precosInputs[i].value);
        if (nome && !isNaN(preco)) {
            preco = parseFloat(preco).toFixed(2); // Garante 2 casas decimais
            novosPrecos[nome] = Number(preco);
            novasQuantidades[nome] = 0;
        }
    }

    precos = novosPrecos;
    quantidades = novasQuantidades;

    // Salvar no localStorage
    localStorage.setItem('produtos', JSON.stringify(precos));

    fecharModal();
    atualizarInterface();
}

function salvarVenda() {
    const venda = {
        produtos: {},
        total: 0,
        data: new Date().toLocaleString()
    };

    for (let produto in quantidades) {
        const qtd = quantidades[produto];
        if (qtd > 0) {
            venda.produtos[produto] = qtd;
            venda.total += qtd * precos[produto];
        }
    }

    if (venda.total === 0) {
        alert("Nenhum produto foi adicionado à venda.");
        return;
    }

    venda.total = Number(venda.total.toFixed(2));
    historico.push(venda);
    localStorage.setItem('historico', JSON.stringify(historico));

    // Zerar contadores
    for (let produto in quantidades) {
        quantidades[produto] = 0;
        document.getElementById('qtd-' + produto).textContent = 0;
    }
    atualizarTotal();
}
document.getElementById('historico-btn').onclick = abrirHistorico;

function abrirHistorico() {
    const div = document.getElementById('historico-conteudo');
    div.innerHTML = '';

    if (historico.length === 0) {
        div.innerHTML = '<p>Nenhuma venda registrada.</p>';
        document.getElementById('historico-modal').classList.remove('hidden');
        return;
    }

    let totalGeral = 0;
    let contadorProdutos = {};

    historico.forEach((venda, index) => {
        const bloco = document.createElement('div');
        bloco.style.marginBottom = '10px';

        bloco.innerHTML = `<strong>Venda ${index + 1}</strong> - ${venda.data}<br>`;
        for (let prod in venda.produtos) {
            const qtd = venda.produtos[prod];
            bloco.innerHTML += `• ${prod}: ${qtd}<br>`;
            contadorProdutos[prod] = (contadorProdutos[prod] || 0) + qtd;
        }
        bloco.innerHTML += `<em>Total: R$${venda.total.toFixed(2).replace('.', ',')}</em>`;
        div.appendChild(bloco);

        totalGeral += venda.total;
    });

    // Resumo final
    const resumo = document.createElement('div');
    resumo.innerHTML = `<hr><strong>Resumo Total:</strong><br>`;
    for (let prod in contadorProdutos) {
        resumo.innerHTML += `• ${prod}: ${contadorProdutos[prod]}<br>`;
    }
    resumo.innerHTML += `<br><strong>Valor Total de Vendas: R$${totalGeral.toFixed(2).replace('.', ',')}</strong>`;

    div.appendChild(resumo);
    document.getElementById('historico-modal').classList.remove('hidden');
}

function fecharHistorico() {
    document.getElementById('historico-modal').classList.add('hidden');
}

function resetarHistorico() {
    if (confirm("Tem certeza que deseja apagar todo o histórico de vendas?")) {
        historico = [];
        localStorage.removeItem('historico');
        abrirHistorico(); // Atualiza a interface imediatamente
    }
}
