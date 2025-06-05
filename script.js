
let precos = { acai: 10, lanche: 10, suco: 2 };
let quantidades = { acai: 0, lanche: 0, suco: 0 };

function alterarQtd(produto, delta) {
    quantidades[produto] = Math.max(0, quantidades[produto] + delta);
    document.getElementById('qtd-' + produto).textContent = quantidades[produto];
    atualizarTotal();
}

function atualizarTotal() {
    let total = 0;
    for (let produto in quantidades) {
        total += quantidades[produto] * precos[produto];
    }
    document.getElementById('total').textContent = total;
}

function resetar() {
    for (let produto in quantidades) {
        quantidades[produto] = 0;
        document.getElementById('qtd-' + produto).textContent = 0;
    }
    atualizarTotal();
}
