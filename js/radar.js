/* Radar demonstrativo de unidades móveis — dados persistidos no LocalStorage compartilhado. */
(function () {
  'use strict';
  const mapa = document.getElementById('mapa-radar');
  if (!mapa) return;
  const { esc, fmtData } = SP;
  let filtro = 'todas';
  let busca = '';
  let selecionada = SP.obterUnidadesMoveis()[0]?.id || null;

  function filtrar(unidades) {
    const termo = busca.trim().toLowerCase();
    return unidades.filter(u => {
      const st = SP.statusUnidadeMovel(u);
      const categoriaOk = filtro === 'todas'
        ? true
        : filtro === 'equipes'
          ? u.tipo.toLowerCase().includes('equipe')
          : st.filtro === filtro || u.categoria === filtro;
      const textoOk = !termo || (u.nome + ' ' + u.comunidade + ' ' + u.comunidades.join(' ') + ' ' + u.tipo).toLowerCase().includes(termo);
      return categoriaOk && textoOk;
    });
  }

  function classeStatus(u) { return SP.statusUnidadeMovel(u).nivel; }

  function renderMapa(unidades) {
    const vis = filtrar(unidades);
    mapa.innerHTML =
      '<svg class="mapa-base" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M0 77 C18 68 23 82 39 68 S67 52 100 58 L100 100 L0 100Z" fill="#BCE1D1"/>' +
      '<path d="M0 25 C18 36 29 18 43 28 S72 42 100 24 L100 42 C75 55 60 36 42 43 S18 49 0 38Z" fill="#DDF2E8"/>' +
      '<path d="M8 82 C25 75 31 64 45 55 S74 48 92 32" fill="none" stroke="#F7B84B" stroke-width="2" stroke-dasharray="4 3"/>' +
      '<path d="M13 70 C29 58 42 62 52 48 S70 35 83 24" fill="none" stroke="#087F5B" stroke-width="1.2" stroke-dasharray="2 2"/>' +
      '<g fill="#FFFFFF" stroke="#0A6B50" stroke-width=".8">' +
      '<circle cx="27" cy="34" r="3"/><circle cx="48" cy="68" r="3"/><circle cx="70" cy="27" r="3"/><circle cx="82" cy="63" r="3"/>' +
      '</g></svg>' +
      vis.map(u => {
        const st = SP.statusUnidadeMovel(u);
        const simb = u.categoria === 'barcos' ? 'B' : u.categoria === 'mutiroes' ? 'M' : u.tipo.includes('vacinação') ? 'V' : 'U';
        return '<button class="marcador marcador-' + classeStatus(u) + '" type="button" data-unidade="' + esc(u.id) + '" ' +
          'style="left:' + u.coordenadas.x + '%;top:' + u.coordenadas.y + '%" ' +
          'aria-label="' + esc(u.nome + ', ' + u.comunidade + ', ' + st.rotulo) + '" title="' + esc(u.nome) + '">' +
          '<span>' + simb + '</span></button>';
      }).join('') +
      '<div class="mapa-comunidades" aria-hidden="true"><span style="left:22%;top:42%">Rio Verde</span>' +
      '<span style="left:43%;top:73%">Vila Esperança</span><span style="left:65%;top:34%">Comunidade das Águas</span>' +
      '<span style="left:76%;top:69%">Serra Alta</span></div>';
    document.getElementById('mapa-resumo').textContent = vis.length + ' unidade(s) exibida(s)';
  }

  function badgeStatus(u) {
    const s = SP.statusUnidadeMovel(u);
    const azul = s.nivel === 'azul' ? 'b-azul' : 'b-' + s.nivel;
    return '<span class="badge ' + azul + '">' + s.icone + ' ' + esc(s.rotulo) + '</span>';
  }

  function renderDetalhes(u) {
    const painel = document.getElementById('painel-unidade');
    if (!u) {
      painel.innerHTML = '<p class="vazio">Selecione uma unidade no mapa ou na lista para ver os detalhes.</p>';
      return;
    }
    const podeAgendar = u.vagas > 0 && u.status !== 'Vagas encerradas';
    const tipoServico = u.servicos[0] || 'Atendimento integrado';
    painel.innerHTML =
      '<div class="painel-cabecalho"><div><p class="painel-etiqueta">' + esc(u.tipo) + '</p><h2>' + esc(u.nome) + '</h2></div>' + badgeStatus(u) + '</div>' +
      '<dl class="dados"><div><dt>Comunidade atendida</dt><dd>' + esc(u.comunidade) + '</dd></div>' +
      '<div><dt>Próxima parada</dt><dd>' + esc(u.parada) + '</dd></div>' +
      '<div><dt>Data e horário</dt><dd>' + fmtData(u.data) + ' · ' + esc(u.horario) + '</dd></div>' +
      '<div><dt>Vagas</dt><dd>' + u.vagas + ' disponíveis</dd></div></dl>' +
      '<div class="detalhe-servicos"><strong>Serviços oferecidos</strong><div>' + u.servicos.map(s => '<span class="chip">' + esc(s) + '</span>').join('') + '</div></div>' +
      '<div class="timeline"><strong>Sequência de paradas</strong>' + u.rota.map((p, i) =>
        '<div class="timeline-item ' + (i === 0 ? 'atual' : '') + '"><span class="timeline-ponto"></span><div><strong>' + esc(p.comunidade) + '</strong><small>' + esc(p.horario) + '</small></div></div>'
      ).join('') + '</div>' +
      (podeAgendar
        ? '<button class="btn btn-grande" type="button" data-agendar="' + esc(u.id) + '">Agendar atendimento</button>'
        : '<button class="btn btn-grande btn-desabilitado" type="button" disabled>Agendamento indisponível</button>' +
          '<p class="mensagem-vagas">Não há vagas disponíveis para esta unidade. Consulte outras datas ou unidades próximas.</p>');
  }

  function renderLista(unidades) {
    const vis = filtrar(unidades);
    document.getElementById('contador-unidades').textContent = vis.length + ' resultado(s)';
    const lista = document.getElementById('lista-unidades');
    if (!vis.length) { lista.innerHTML = '<p class="vazio">Nenhuma unidade corresponde aos filtros selecionados.</p>'; return; }
    lista.innerHTML = vis.map(u => {
      const pode = u.vagas > 0 && u.status !== 'Vagas encerradas';
      return '<article class="card unidade-card ' + classeStatus(u) + '" data-card-unidade="' + esc(u.id) + '">' +
        '<header><div><p class="tipo-unidade">' + esc(u.tipo) + '</p><h3>' + esc(u.nome) + '</h3></div>' + badgeStatus(u) + '</header>' +
        '<dl class="dados"><div><dt>Comunidade</dt><dd>' + esc(u.comunidade) + '</dd></div>' +
        '<div><dt>Próxima parada</dt><dd>' + esc(u.parada) + '</dd></div>' +
        '<div><dt>Data</dt><dd>' + fmtData(u.data) + '</dd></div>' +
        '<div><dt>Horário</dt><dd>' + esc(u.horario) + '</dd></div>' +
        '<div><dt>Vagas</dt><dd>' + u.vagas + ' disponíveis</dd></div></dl>' +
        '<div class="chip-area">' + u.servicos.map(s => '<span class="chip">' + esc(s) + '</span>').join('') + '</div>' +
        '<div class="acoes"><button class="btn btn-sec" type="button" data-selecionar="' + esc(u.id) + '">Ver rota</button>' +
        (pode ? '<button class="btn" type="button" data-agendar="' + esc(u.id) + '">Agendar atendimento</button>'
          : '<button class="btn btn-desabilitado" type="button" disabled>Vagas encerradas</button>') + '</div></article>';
    }).join('');
  }

  function atualizar() {
    const unidades = SP.obterUnidadesMoveis();
    renderMapa(unidades);
    renderLista(unidades);
    renderDetalhes(SP.obterUnidadeMovel(selecionada));
  }

  mapa.addEventListener('click', e => {
    const b = e.target.closest('button[data-unidade]');
    if (!b) return;
    selecionada = b.dataset.unidade;
    renderDetalhes(SP.obterUnidadeMovel(selecionada));
  });
  document.getElementById('lista-unidades').addEventListener('click', e => {
    const sel = e.target.closest('[data-selecionar]');
    const ag = e.target.closest('[data-agendar]');
    if (sel) {
      selecionada = sel.dataset.selecionar;
      renderDetalhes(SP.obterUnidadeMovel(selecionada));
      document.getElementById('painel-unidade').scrollIntoView({ block: 'start', behavior: 'smooth' });
    } else if (ag) {
      const u = SP.obterUnidadeMovel(ag.dataset.agendar);
      if (!u || u.vagas <= 0) { SP.toast('Não há vagas disponíveis para esta unidade.'); return; }
      const tipo = u.servicos.includes('Consulta médica') ? 'Consulta médica'
        : u.servicos.includes('Vacinação') ? 'Vacinação' : 'Atendimento integrado';
      location.href = 'agendar.html?radar=1&unidadeId=' + encodeURIComponent(u.id) +
        '&unidade=' + encodeURIComponent(u.nome) + '&comunidade=' + encodeURIComponent(u.comunidade) +
        '&tipo=' + encodeURIComponent(tipo) + '&data=' + encodeURIComponent(u.data);
    }
  });
  document.getElementById('painel-unidade').addEventListener('click', e => {
    const ag = e.target.closest('[data-agendar]');
    if (!ag) return;
    const u = SP.obterUnidadeMovel(ag.dataset.agendar);
    if (!u || u.vagas <= 0) { SP.toast('Não há vagas disponíveis para esta unidade.'); return; }
    const tipo = u.servicos.includes('Consulta médica') ? 'Consulta médica'
      : u.servicos.includes('Vacinação') ? 'Vacinação' : 'Atendimento integrado';
    location.href = 'agendar.html?radar=1&unidadeId=' + encodeURIComponent(u.id) +
      '&unidade=' + encodeURIComponent(u.nome) + '&comunidade=' + encodeURIComponent(u.comunidade) +
      '&tipo=' + encodeURIComponent(tipo) + '&data=' + encodeURIComponent(u.data);
  });
  document.getElementById('filtros-radar').addEventListener('click', e => {
    const b = e.target.closest('button[data-filtro]');
    if (!b) return;
    filtro = b.dataset.filtro;
    document.querySelectorAll('#filtros-radar .filtro').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    atualizar();
  });
  document.getElementById('busca-radar').addEventListener('input', e => { busca = e.target.value; atualizar(); });
  atualizar();
})();
