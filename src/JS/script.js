const UUID = "6e98a715-302f-4475-b7c4-475bf49cdb5f";
const menuLateral = document.querySelector(".menu-lateral");
const usuario = document.querySelector(".usuario");

let nomeParticipante = { name: prompt("Qual é o seu nome?") };
let destinoMensagem = document.querySelector(".destino-da-mensagem");
let historicoMensagens = document.querySelector("main");
let participanteSelecionado = null;

let from,
    to,
    text,
    type;

let mensagemAEnviar = {};
let conteudoMensagem = document.querySelector(".entrada-de-mensagem");

verificarAcesso();

function verificarAcesso() {
    const promessa = axios.post(`https://mock-api.driven.com.br/api/v6/uol/participants/${UUID}`, nomeParticipante)

    promessa.then(entrarNaSala);
    promessa.catch(mostraErroLogin);
}

function entrarNaSala() {
    buscarMensagem();
    buscarParticipantes();

    setTimeout(rolarParaBaixo, 500);
    setInterval(manterConexao, 5000);
    setInterval(buscarMensagem, 3000);
    setInterval(buscarParticipantes, 10000);
}

function mostraErroLogin() {
    if (nomeParticipante.name === "") {
        nomeParticipante = { name: prompt("Você deve escolher um nome para continuar.") };
    } else {
        nomeParticipante = { name: prompt("Esse nome já está sendo usado. Por favor, escolha outro nome.") };
    }

    verificarAcesso();
}

function manterConexao() {
    axios.post(`https://mock-api.driven.com.br/api/v6/uol/status/${UUID}`, nomeParticipante);
}

function avisarDesconexao() {
    alert("Você foi desconectado. A página será recarregada.");
    window.location.reload();
}

function criarMensagem() {
    const contatoSelecionado = document.querySelector(".contato-selecionado");
    const visibilidadeSelecionada = document.querySelector(".visibilidade-selecionada");

    from = nomeParticipante.name;
    to = contatoSelecionado.id;
    text = conteudoMensagem.value;

    switch (visibilidadeSelecionada.id) {
        case "público":
            type = "message";
            break;
        case "reservadamente":
            type = "private_message"
    }

    mensagemAEnviar = {
        from: `${from}`,
        to: `${to}`,
        text: `${text}`,
        type: `${type}`
    };
}

function enviarMensagem() {
    criarMensagem();
    const promessa = axios.post(`https://mock-api.driven.com.br/api/v6/uol/messages/${UUID}`, mensagemAEnviar);

    promessa.then(buscarMensagem);
    promessa.catch(avisarDesconexao);
    conteudoMensagem.value = "";
}

function buscarMensagem() {
    const promessa = axios.get(`https://mock-api.driven.com.br/api/v6/uol/messages/${UUID}`)

    promessa.then(renderizarMensagens);
}

function renderizarMensagens(resposta) {
    const ultimaMensagem = document.querySelector(".mensagem-contida:last-child");

    historicoMensagens.innerHTML = "";
    resposta.data.forEach(mensagem => {
        switch (mensagem.type) {
            case "status":
                historicoMensagens.innerHTML += `<span class="mensagem-de-status mensagem-contida"><p>(${mensagem.time})</p> <b>${mensagem.from}</b> ${mensagem.text} </span>`
                break;
            case "message":
                historicoMensagens.innerHTML += `<span class="mensagem-normal mensagem-contida"><p>(${mensagem.time})</p> <b>${mensagem.from}</b> para <b>${mensagem.to}</b>: ${mensagem.text} </span>`
                break;
            case "private_message":
                if (mensagem.from === nomeParticipante.name || mensagem.to === nomeParticipante.name) {
                    historicoMensagens.innerHTML += `<span class="mensagem-reservada mensagem-contida"><p>(${mensagem.time})</p> <b>${mensagem.from}</b> reservadamente para <b>${mensagem.to}</b>: ${mensagem.text} </span>`
                }
                break;
        }
    })

    const novaMensagem = document.querySelector(".mensagem-contida:last-child");
    if (ultimaMensagem.innerHTML !== novaMensagem.innerHTML) {
        rolarParaBaixo();
    }
}

function buscarParticipantes() {
    const promessa = axios.get(`https://mock-api.driven.com.br/api/v6/uol/participants/${UUID}`);

    promessa.then(atualizarListaParticipantes);
}

function atualizarListaParticipantes(resposta) {
    usuario.innerHTML = "";

    if (participanteSelecionado !== null) {
        resposta.data.forEach(participante => {
            if (participante.name !== nomeParticipante.name && participante.name !== participanteSelecionado.id) {
                usuario.innerHTML +=
                    `<li id="${participante.name}" onclick="selecionarContato(this)">
                    <ion-icon name="person-circle"></ion-icon>
                    ${participante.name}
                    <ion-icon class="check-contato" name="checkmark-sharp"></ion-icon>
                 </li>`
            } else if (participante.name === participanteSelecionado.id) {
                usuario.innerHTML += participanteSelecionado.outerHTML
            }
        })
        const todos = document.querySelector("#Todos");
        const contatoSelecionado = document.querySelector(".contato-selecionado");
        if (contatoSelecionado === null) {
            todos.classList.add("contato-selecionado");
            avisarDestinoDaMensagem();
        }} else {
            resposta.data.forEach(participante => {
                if (participante.name !== nomeParticipante.name) {
                    usuario.innerHTML +=
                        `<li id="${participante.name}" onclick="selecionarContato(this)">
                    <ion-icon name="person-circle"></ion-icon>
                    ${participante.name}
                    <ion-icon class="check-contato" name="checkmark-sharp"></ion-icon>
                 </li>`
                }
            })
        }
    }

    function avisarDestinoDaMensagem() {
        const contatoSelecionado = document.querySelector(".contato-selecionado");
        const visibilidadeSelecionada = document.querySelector(".visibilidade-selecionada");
        destinoMensagem.innerHTML = `Enviando para ${contatoSelecionado.id} (${visibilidadeSelecionada.id})`
    }

    function selecionarContato(contato) {
        const contatoSelecionado = document.querySelector(".contato-selecionado");
        contatoSelecionado.classList.remove("contato-selecionado");
        contato.classList.add("contato-selecionado");
        participanteSelecionado = document.querySelector(".usuario .contato-selecionado");
        avisarDestinoDaMensagem()
    }

    function selecionarVisibilidade(visibilidade) {
        const visibilidadeSelecionada = document.querySelector(".visibilidade-selecionada");
        visibilidadeSelecionada.classList.remove("visibilidade-selecionada");
        visibilidade.classList.add("visibilidade-selecionada");
        avisarDestinoDaMensagem()
    }

    function abrirMenu() {
        menuLateral.classList.remove("escondido")
    }

    function fecharMenu() {
        menuLateral.classList.add("escondido")
    }

    function rolarParaBaixo() {
        const ultimaMensagem = document.querySelector('.mensagem-contida:last-child');
        ultimaMensagem.scrollIntoView({ behavior: 'smooth' });
    }