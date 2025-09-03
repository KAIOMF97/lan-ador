function trajetoria() {
    var velocidadeInicial = parseFloat(document.getElementById("velocidade").value);
    var angulo = parseFloat(document.getElementById("angulo").value);
    var gravidade = parseFloat(document.getElementById("gravidade").value);
    var alturaInicial = parseFloat(document.getElementById("alturaInicial").value);
    var massa = parseFloat(document.getElementById("massa").value);
    var resistencia = parseFloat(document.getElementById("resistencia").value);

    if (!verificacao1(velocidadeInicial, angulo, gravidade, alturaInicial, massa, resistencia)) return;

    ({ velocidadeInicial, angulo, gravidade, alturaInicial, massa, resistencia } = verificacao2(velocidadeInicial, angulo, gravidade, alturaInicial, massa, resistencia));

    // Calcule o tempo total normalmente
    var tempoSubida = calcularTempoSubida(velocidadeInicial, angulo, gravidade, resistencia, massa);
    var alturaMaxima = calcularAlturaMaxima(velocidadeInicial, angulo, gravidade, alturaInicial);
    var tempoDescida = calcularTempoDescida(alturaMaxima, gravidade);
    var tempoTotal = tempoSubida + tempoDescida;

    var alcanceFinal = calcularAlcanceFinalComTempo(velocidadeInicial, angulo, resistencia, tempoTotal);
    var trajetoriaObliqua = calcularTrajetoriaComTempo(velocidadeInicial, angulo, gravidade, alturaInicial, resistencia, massa, tempoTotal);

    document.getElementById("spanSituacao").innerHTML =
        "Tempo de Subida: " + tempoSubida.toFixed(2) + " s<br>" +
        "Tempo de Descida: " + tempoDescida.toFixed(2) + " s<br>" +
        "Tempo Total: " + tempoTotal.toFixed(2) + " s<br>" +
        "Altura Máxima: " + alturaMaxima.toFixed(2) + " m<br>" +
        "Alcance Final: " + alcanceFinal.toFixed(2) + " m";

    desenharTrajetoriaAnimada(trajetoriaObliqua.pontosTrajetoria, alturaInicial);
}

function verificacao1(v, a, g, h, m, r) {
    if (v > 100 || v < 0 || a > 90 || a <= 0 || g > 30 || g < 1 ||
        (h && (h < 0 || h > 100)) || m <= 0 || m > 100 || r < 0 || r > 1) {
        document.getElementById("spanSituacao").textContent =
            "verifique os dados: 0 ≤ velocidade ≤ 100, 0° < ângulo ≤ 90°, 1 ≤ gravidade ≤ 30, 0 ≤ altura ≤ 100, massa > 0 e ≤ 100 kg, resistência entre 0 e 1.";
        return false;
    }
    return true;
}

function verificacao2(v, a, g, h, m, r) {
    if (isNaN(v)) v = 50;
    if (isNaN(a)) a = 45;
    if (isNaN(g)) g = 9.8;
    if (isNaN(h)) h = 0;
    if (isNaN(m)) m = 1;
    if (isNaN(r)) r = 0;
    return { velocidadeInicial: v, angulo: a, gravidade: g, alturaInicial: h, massa: m, resistencia: r };
}

function calcularAlturaMaxima(v, a, g, h) {
    var altura = Math.pow(v * Math.sin(a * Math.PI / 180), 2) / (2 * g);
    return altura + h;
}

function calcularTempoSubida(v, a, g, r, m) {
    let vy = v * Math.sin(a * Math.PI / 180);
    let forcaResistencia = r * vy;
    let aceleracaoTotal = g + (forcaResistencia / m);
    return vy / aceleracaoTotal;
}

function calcularTempoDescida(altura, g) {
    return Math.sqrt((2 * altura) / g);
}

function calcularAlcanceFinalComTempo(v, a, r, tempoTotal) {
    let vx = v * Math.cos(a * Math.PI / 180) * (1 - r);
    return vx * tempoTotal;
}

function calcularTrajetoriaComTempo(v, a, g, h, r, m, tempoTotal) {
    var rad = a * Math.PI / 180;
    var vX = v * Math.cos(rad) * (1 - r);
    var vY = v * Math.sin(rad);
    var pontos = [];
    var deltaT = 0.01;

    for (var t = 0; t <= tempoTotal; t += deltaT) {
        let x = vX * t;
        let y = h + vY * t - 0.5 * g * t * t;
        if (y < 0) y = 0;
        pontos.push({ x, y });
    }

    return { pontosTrajetoria: pontos };
}

// Alvos fixos para cada nível (apenas UM alvo por nível, maior e mais centralizado)
const alvosPorNivel = [
    // Nível 1
    [
        { x: 100, y: 40, raio: 18 }
    ],
    // Nível 2
    [
        { x: 180, y: 60, raio: 22 }
    ],
    // Nível 3
    [
        { x: 260, y: 50, raio: 26 }
    ]
];
let nivelAtual = 0; // Nenhum nível selecionado inicialmente
let alvos = [];     // Nenhum alvo
let animacaoEmAndamento = false; // flag para bloquear troca de nível durante a animação

function selecionarNivel(nivel) {
    if (animacaoEmAndamento) {
        alert("Aguarde terminar a trajetória antes de mudar o nível!");
        return;
    }

    nivelAtual = nivel;
    alvos = alvosPorNivel[nivelAtual - 1];
    document.getElementById("spanSituacao").innerHTML = "...";
    desenharAlvosCanvas();

    // Bloqueia o input da altura
    const inputAltura = document.getElementById("alturaInicial");
    inputAltura.disabled = true;

    // Opcional: define a altura inicial fixa para o nível (ex.: 0)
}


// Carregar imagem do alvo (escopo global)
const alvoImg = new Image();
alvoImg.src = "ds.png"; // sua imagem

// Função para desenhar os alvos no canvas
function desenharAlvosCanvas() {
    const canvas = document.getElementById("canvasFoguete");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const paddingTop = 20;
    const paddingRight = 20;
    const paddingBottom = 20;
    const paddingLeft = 50;

    // Estime um espaço padrão para exibir os alvos
    const maxX = Math.max(...alvos.map(a => a.x), 100);
    const maxY = Math.max(...alvos.map(a => a.y), 30);

    const escalaX = (canvas.width - paddingLeft - paddingRight) / maxX;
    const escalaY = (canvas.height - paddingTop - paddingBottom) / 100;
    const escala = Math.min(escalaX, escalaY);

    // Linha do solo
    const ySolo = canvas.height - paddingBottom;
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, ySolo);
    ctx.lineTo(canvas.width - paddingRight, ySolo);
    ctx.stroke();

    // Desenha imagem do alvo
    for (const alvo of alvos) {
        const x = paddingLeft + alvo.x * escala - alvo.raio;
        const y = canvas.height - paddingBottom - alvo.y * escala - alvo.raio;
        ctx.drawImage(alvoImg, x, y, alvo.raio * 2, alvo.raio * 2);
    }
}

function desenharTrajetoriaAnimada(pontos, alturaInicial = 0) {
    const canvas = document.getElementById("canvasFoguete");
    const ctx = canvas.getContext("2d");

    const fogueteImg = new Image();
    fogueteImg.src = "mf.png"; // Caminho da imagem

    const paddingTop = 20;
    const paddingRight = 20;
    const paddingBottom = 20;
    const paddingLeft = 50;

    if (pontos.length === 0) return;
    animacaoEmAndamento = true;

    const maxX = Math.max(...pontos.map(p => p.x), ...alvos.map(a => a.x));
    const maxYReal = Math.max(...pontos.map(p => p.y), ...alvos.map(a => a.y));
    const alturaMaxY = Math.max(100, maxYReal, alturaInicial + 5);

    const escalaX = (canvas.width - paddingLeft - paddingRight) / maxX;
    const escalaY = (canvas.height - paddingTop - paddingBottom) / alturaMaxY;
    const escala = Math.min(escalaX, escalaY);

    let i = 0;
    const duracaoAnimacao = 7; // segundos
    const totalFrames = Math.ceil(duracaoAnimacao * 60);
    const pontosPorFrame = Math.max(pontos.length / totalFrames, 1);

    let acertouAlvo = false;

    function desenhaEixos() {
        ctx.strokeStyle = "#AAA";
        ctx.fillStyle = "#AAA";
        ctx.lineWidth = 1;
        ctx.font = "12px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        ctx.beginPath();
        ctx.moveTo(paddingLeft - 10, paddingTop);
        ctx.lineTo(paddingLeft - 10, canvas.height - paddingBottom);
        ctx.stroke();

        const marcadorEspaco = alturaMaxY > 5000 ? 500 : alturaMaxY > 1500 ? 150 : alturaMaxY > 550 ? 50 : alturaMaxY > 100 ? 20 : 10;
        for (let m = 0; m <= alturaMaxY; m += marcadorEspaco) {
            let y = canvas.height - paddingBottom - m * escala;
            ctx.beginPath();
            ctx.moveTo(paddingLeft - 10, y);
            ctx.lineTo(paddingLeft - 5, y);
            ctx.stroke();
            ctx.fillText(m.toString(), paddingLeft - 15, y);
        }

        // Linha do solo
        const ySolo = canvas.height - paddingBottom - alturaInicial * escala;
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, ySolo);
        ctx.lineTo(canvas.width - paddingRight, ySolo);
        ctx.stroke();

          // Desenha os alvos no eixo
        for (const alvo of alvos) {
            const x = paddingLeft + alvo.x * escala - alvo.raio;
            const y = canvas.height - paddingBottom - alvo.y * escala - alvo.raio;
            ctx.drawImage(alvoImg, x, y, alvo.raio * 2, alvo.raio * 2);
        }
    }


    function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        desenhaEixos();

        // Linha da trajetória
        ctx.beginPath();
        for (let j = 0; j <= Math.floor(i) && j < pontos.length; j++) {
            const x = paddingLeft + pontos[j].x * escala;
            const y = canvas.height - paddingBottom - pontos[j].y * escala;
            if (j === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 2;
        ctx.stroke();

        if (i < pontos.length) {
            const fogueteX = paddingLeft + pontos[Math.floor(i)].x * escala;
            const fogueteY = canvas.height - paddingBottom - pontos[Math.floor(i)].y * escala;

            ctx.save();
            ctx.translate(fogueteX, fogueteY);
            ctx.drawImage(fogueteImg, -20, -20, 40, 40);
            ctx.restore();
        }

        // Verificar colisão com alvo
        const foguetePos = pontos[Math.floor(i)];
        for (const alvo of alvos) {
            const alvoX = paddingLeft + alvo.x * escala;
            const alvoY = canvas.height - paddingBottom - alvo.y * escala;
            const fogueteRealX = paddingLeft + foguetePos.x * escala;
            const fogueteRealY = canvas.height - paddingBottom - foguetePos.y * escala;
            const dist = Math.sqrt(Math.pow(fogueteRealX - alvoX, 2) + Math.pow(fogueteRealY - alvoY, 2));
            if (dist < alvo.raio) {
                acertouAlvo = true;
            }
        }

        i += pontosPorFrame;

        if (i < pontos.length) {
            requestIdAnimacao = requestAnimationFrame(animar);
        } else {
            animacaoEmAndamento = false;
            if (nivelAtual !== 0) {
                if (acertouAlvo) {
                    document.getElementById("spanSituacao").innerHTML += "<br><b style='color:lime'>você acertou o alvo!</b>";
                    alert("Parabéns! Você ganhou!");
                } else {
                    document.getElementById("spanSituacao").innerHTML += "<br><b style='color:red'>Nenhum alvo atingido.</b>";
                }
            }
        }
    }

    fogueteImg.onload = () => animar();
}




function reiniciarJogo() {
    // Para qualquer animação em execução
    if (requestIdAnimacao) {
        cancelAnimationFrame(requestIdAnimacao);
        requestIdAnimacao = null;
    }

    animacaoEmAndamento = false;

    const canvas = document.getElementById("canvasFoguete");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Remove os alvos
    alvos = [];
    nivelAtual = 0;

    // Reseta status
    document.getElementById("spanSituacao").innerHTML = "...";

    // Desbloqueia input de altura
    document.getElementById("alturaInicial").disabled = false;
}

