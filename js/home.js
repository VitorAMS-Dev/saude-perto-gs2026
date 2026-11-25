/* Saúde Perto — painel inicial: tudo vem do LocalStorage (via storage.js). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  if (!$('painel-resumo')) return;
  const { esc, fmtData } = SP;

  function vazio(msg, href, txt) {
    return '<p class="vazio">' + esc(msg) + '</p><a class="btn btn-sec" href="' + href + '">' + esc(txt) + '</a>';
  }

  function cardAtendimento() {
    const a = SP.proximoAtendimento();
    $('card-atendimento').innerHTML = !a
      ? vazio('Nenhum atendimento agendado.', 'pages/agendar.html', 'Agendar atendimento')
      : '<p class="destaque">' + fmtData(a.data) + '</p>' +
        '<dl class="dados"><div><dt>Turno</dt><dd>' + esc(a.turno) + '</dd></div>' +
        '<div><dt>Unidade</dt><dd>' + esc(a.unidade) + '</dd></div>' +
        '<div><dt>Protocolo</dt><dd>' + esc(a.protocolo) + '</dd></div></dl>' +
        '<a class="link" href="pages/agendar.html#historico">Ver comprovante</a>';
  }

  function cardVacinal() {
    const vs = SP.obterVacinas();
    const st = vs.map(SP.statusVacina);
    const aplicadas = vs.filter(v => v.situacao === 'aplicada').length;
    const pend = vs.filter(v => v.situacao === 'pendente').length;
    const reforcos = st.filter(s => s.codigo === 'reforco').length;
    const pct = vs.length ? Math.round(aplicadas / vs.length * 100) : 0;
    $('card-vacinal').innerHTML =
      '<p class="destaque">' + aplicadas + ' <span>vacinas registradas</span></p>' +
      '<div class="barra" role="img" aria-label="' + aplicadas + ' de ' + vs.length + ' vacinas aplicadas"><span style="width:' + pct + '%"></span></div>' +
      '<dl class="dados"><div><dt>Doses pendentes</dt><dd>' + pend + '</dd></div>' +
      '<div><dt>Próximos reforços</dt><dd>' + reforcos + '</dd></div></dl>' +
      '<a class="link" href="pages/vacinas.html">Abrir carteira de vacinação</a>';
  }

  function cardCampanhas() {
    const cs = SP.obterCampanhas().map(c => ({ c, s: SP.statusCampanha(c) }));
    const ativas = cs.filter(x => x.s.codigo === 'ativa' || x.s.codigo === 'encerrando');
    const fim = cs.filter(x => x.s.codigo === 'encerrando');
    $('card-campanhas').innerHTML =
      '<p class="destaque">' + ativas.length + ' <span>campanhas ativas</span></p>' +
      (fim.length
        ? '<p class="aviso-mini"><span class="badge b-amarelo">! Atenção</span> ' + fim.length + ' encerrando em breve: ' + fim.map(x => esc(x.c.nome)).join('; ') + '.</p>'
        : '<p class="aviso-mini">Nenhuma campanha perto do encerramento.</p>') +
      '<a class="link" href="pages/vacinas.html#campanhas">Ver campanhas</a>';
  }

  function cardDistancia() {
    const a = SP.proximoAtendimento();
    const u = SP.obterUsuario();
    const comunidade = a ? a.comunidade : u.comunidade;
    const unidade = a ? a.unidade : u.unidade;
    const rota = SP.obterRota(comunidade, unidade);
    const km = rota ? rota.km : (a ? a.distancia : u.distancia);
    $('card-distancia').innerHTML =
      '<p class="destaque">' + esc(km) + ' km <span>até a ' + esc(unidade) + '</span></p>' +
      '<dl class="dados"><div><dt>Comunidade de origem</dt><dd>' + esc(comunidade) + '</dd></div>' +
      '<div><dt>Tempo simulado</dt><dd>' + (rota ? rota.min + ' min' : '—') + '</dd></div></dl>' +
      '<p class="aviso-mini">Organize o deslocamento com antecedência. Valores demonstrativos.</p>';
  }

  function cardUnidadeMovel() {
    const box = $('card-unidade-movel');
    if (!box) return;
    const u = SP.proximaUnidadeMovel();
    if (!u) { box.innerHTML = '<p class="vazio">Nenhuma unidade programada no momento.</p>'; return; }
    const st = SP.statusUnidadeMovel(u);
    $('t-unidade-home').textContent = u.nome;
    box.innerHTML =
      '<dl class="dados"><div><dt>Comunidade</dt><dd>' + esc(u.comunidade) + '</dd></div>' +
      '<div><dt>Data</dt><dd>' + fmtData(u.data) + ' · ' + esc(u.horario) + '</dd></div>' +
      '<div><dt>Situação</dt><dd><span class="badge b-' + (st.nivel === 'azul' ? 'azul' : st.nivel) + '">' + st.icone + ' ' + esc(st.rotulo) + '</span></dd></div></dl>';
  }

  function cardEmergencia() {
    const atual = SP.obterEmergenciaAtual();
    $('card-emergencia').innerHTML = !atual
      ? '<p class="vazio">Nenhuma solicitação registrada.</p><a class="btn btn-sec" href="pages/emergencia.html">Solicitar atendimento</a>'
      : atual.status === 'Solicitação cancelada'
        ? '<p class="destaque">Cancelada</p>' +
          '<dl class="dados"><div><dt>Protocolo</dt><dd>' + esc(atual.protocolo) + '</dd></div></dl>' +
          '<a class="link" href="pages/emergencia.html">Ver histórico da solicitação</a>'
        : '<p class="destaque">' + esc(atual.posicaoFila) + 'ª <span>posição na fila</span></p>' +
        '<dl class="dados"><div><dt>Protocolo</dt><dd>' + esc(atual.protocolo) + '</dd></div>' +
        '<div><dt>Status</dt><dd><span class="badge b-amarelo">! ' + esc(atual.status) + '</span></dd></div></dl>' +
        '<a class="link" href="pages/emergencia.html">Acompanhar atendimento</a>';
  }

  function cardDomiciliar() {
    const v = SP.obterDomicilio().proxima;
    $('card-domiciliar').innerHTML =
      '<p class="destaque">' + fmtData(v.data) + '</p>' +
      '<dl class="dados"><div><dt>Horário</dt><dd>' + esc(v.horario) + '</dd></div>' +
      '<div><dt>Equipe</dt><dd>' + esc(v.equipe) + '</dd></div>' +
      '<div><dt>Status</dt><dd><span class="badge b-verde">✔ ' + esc(v.status) + '</span></dd></div></dl>' +
      '<a class="link" href="pages/domiciliar.html">Consultar visita domiciliar</a>';
  }

  function alertas() {
    $('lista-alertas').innerHTML = SP.gerarAlertas().map(a => {
      const ic = { verde: '✔', amarelo: '!', vermelho: '✖' }[a.nivel];
      const nm = { verde: 'Informação', amarelo: 'Atenção', vermelho: 'Urgente' }[a.nivel];
      return '<li class="alerta n-' + a.nivel + '"><span class="badge b-' + a.nivel + '">' + ic + ' ' + nm + '</span>' +
        '<span class="alerta-texto">' + esc(a.texto) + '</span>' +
        (a.acao ? '<a class="link" href="' + a.acao.href + '">' + esc(a.acao.texto) + '</a>' : '') + '</li>';
    }).join('');
  }

  cardAtendimento(); cardVacinal(); cardCampanhas(); cardDistancia(); cardUnidadeMovel(); cardEmergencia(); cardDomiciliar(); alertas();
})();
