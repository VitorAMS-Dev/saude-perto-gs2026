/* Saúde Perto — agendamento, comprovante e histórico. */
(function () {
  'use strict';
  const form = document.getElementById('form-agendamento');
  if (!form) return;
  const $ = id => document.getElementById(id);
  const { esc, fmtData } = SP;

  /* Documentos sugeridos por tipo (orientação demonstrativa, não oficial). */
  const BASE = ['Documento com foto', 'Cartão Nacional de Saúde (CNS)'];
  const DOCS = {
    'Consulta médica': BASE.concat('Exames e receitas anteriores, se houver'),
    'Vacinação': BASE.concat('Caderneta de vacinação'),
    'Exame de rotina': BASE.concat('Pedido médico do exame'),
    'Retorno médico': BASE.concat('Receitas e exames da última consulta'),
    'Atendimento integrado': BASE.concat('Caderneta de vacinação', 'Pedidos e exames anteriores')
  };
  const params = new URLSearchParams(location.search);
  const vacinaParam = params.get('vacina') || '';
  const unidadeMovelParam = params.get('unidade') || '';
  const comunidadeMovelParam = params.get('comunidade') || '';
  const dataMovelParam = params.get('data') || '';
  const unidadeMovelIdParam = params.get('unidadeId') || '';
  let mostrado = null;

  function opcoes(sel, itens, rotulo) {
    sel.innerHTML = '<option value="">' + rotulo + '</option>' + itens.map(i => '<option value="' + esc(i.v) + '">' + esc(i.t) + '</option>').join('');
  }
  function popularUnidades(escolhida) {
    const c = $('comunidade').value, u = $('unidade');
    u.disabled = !c;
    if (!c) { opcoes(u, [], 'Escolha primeiro a comunidade'); return; }
    opcoes(u, (SP.ROTAS[c] || []).map(r => ({ v: r.unidade, t: r.unidade + ' (' + r.km + ' km)' })), 'Selecione a unidade');
    if (unidadeMovelParam) {
      u.insertAdjacentHTML('beforeend', '<option value="' + esc(unidadeMovelParam) + '">' + esc(unidadeMovelParam) + ' (atendimento itinerante)</option>');
    }
    if (escolhida) u.value = escolhida;
  }

  /* Simulação do planejamento de deslocamento (dados demonstrativos). */
  function atualizarPlano() {
    const rota = SP.obterRota($('comunidade').value, $('unidade').value);
    $('distancia').value = rota ? rota.km + ' km' : '';
    if (unidadeMovelParam && $('unidade').value === unidadeMovelParam) {
      $('distancia').value = '25 km';
      $('plano').innerHTML = '<p class="rota">' + esc($('comunidade').value) + ' → ' + esc(unidadeMovelParam) + '</p>' +
        '<dl class="dados"><div><dt>Modalidade</dt><dd>Atendimento itinerante</dd></div>' +
        '<div><dt>Distância aproximada</dt><dd>25 km (demonstrativa)</dd></div>' +
        '<div><dt>Tempo estimado</dt><dd>40 minutos (demonstrativo)</dd></div></dl>' +
        '<p><strong>Orientação:</strong> confirme a próxima parada antes de sair e chegue cerca de 20 minutos antes.</p>';
      return;
    }
    $('plano').innerHTML = !rota
      ? '<p class="vazio">Escolha a comunidade e a unidade para ver o planejamento do deslocamento.</p>'
      : '<p class="rota">' + esc($('comunidade').value) + ' → ' + esc(rota.unidade) + '</p>' +
        '<dl class="dados"><div><dt>Distância aproximada</dt><dd>' + rota.km + ' km</dd></div>' +
        '<div><dt>Tempo estimado (simulado)</dt><dd>' + rota.min + ' minutos</dd></div>' +
        '<div><dt>Unidade de destino</dt><dd>' + esc(rota.unidade) + '</dd></div></dl>' +
        '<p><strong>Orientação:</strong> organize o deslocamento com antecedência, chegue cerca de 20 minutos antes e confira os documentos necessários.</p>' +
        '<p class="aviso-mini">Distância e tempo são dados demonstrativos, não navegação em tempo real.</p>';
  }

  function preencherPadroes() {
    const u = SP.obterUsuario();
    $('paciente').value = u.nome;
    const comunidade = comunidadeMovelParam || u.comunidade;
    if (comunidadeMovelParam && !Object.prototype.hasOwnProperty.call(SP.ROTAS, comunidadeMovelParam)) {
      $('comunidade').insertAdjacentHTML('beforeend', '<option value="' + esc(comunidadeMovelParam) + '">' + esc(comunidadeMovelParam) + '</option>');
    }
    $('comunidade').value = comunidade;
    popularUnidades(unidadeMovelParam || u.unidade);
    $('data').min = SP.hoje();
    if (dataMovelParam && dataMovelParam >= SP.hoje()) $('data').value = dataMovelParam;
    const tipo = params.get('tipo');
    if (tipo && DOCS[tipo]) $('tipo').value = tipo;
    $('aviso-vacina').hidden = !vacinaParam;
    if (vacinaParam) $('aviso-vacina').textContent = 'Você está agendando a vacina: ' + vacinaParam + '. O tipo de atendimento já foi preenchido.';
    atualizarPlano();
  }

  /* ---------- Validação ---------- */
  function validar() {
    const regras = [
      ['paciente', v => v.trim().length >= 5, 'Digite o nome completo do paciente.'],
      ['comunidade', v => v, 'Selecione a comunidade de origem.'],
      ['unidade', v => v, 'Selecione a unidade de saúde de destino.'],
      ['tipo', v => v, 'Selecione o tipo de atendimento.'],
      ['data', v => v && v >= SP.hoje(), 'Escolha uma data a partir de hoje.'],
      ['transporte', v => v, 'Selecione como pretende se deslocar.']
    ];
    let primeiro = null;
    regras.forEach(([id, ok, msg]) => {
      const c = $(id), bom = ok(c.value);
      c.setAttribute('aria-invalid', bom ? 'false' : 'true');
      $('erro-' + id).textContent = bom ? '' : msg;
      if (!bom && !primeiro) primeiro = c;
    });
    const turno = form.querySelector('input[name="turno"]:checked');
    $('erro-turno').textContent = turno ? '' : 'Escolha o turno preferencial.';
    if (!turno && !primeiro) primeiro = form.querySelector('input[name="turno"]');
    if (primeiro) primeiro.focus();
    return !primeiro;
  }

  /* ---------- Comprovante ---------- */
  function textoComprovante(a) {
    return ['COMPROVANTE DE AGENDAMENTO — SAÚDE PERTO (SIMULADO)',
      'Protocolo: ' + a.protocolo, 'Paciente: ' + a.paciente, 'Atendimento: ' + a.tipo + (a.vacina ? ' (' + a.vacina + ')' : ''),
      'Unidade: ' + a.unidade, 'Comunidade de origem: ' + a.comunidade, 'Distância aproximada: ' + a.distancia + ' km',
      'Data: ' + fmtData(a.data), 'Turno: ' + a.turno, 'Deslocamento: ' + a.transporte,
      'Orientação: organize o deslocamento com antecedência.',
      'Documentos: ' + (DOCS[a.tipo] || BASE).join('; '),
      'Aviso: agendamento simulado, sem confirmação real de unidade de saúde.'].join('\n');
  }
  function mostrarComprovante(a, rolar) {
    mostrado = a;
    const st = SP.statusAgendamento(a);
    const linha = (t, v) => '<div><dt>' + t + '</dt><dd>' + esc(v) + '</dd></div>';
    $('comprovante').innerHTML =
      '<header class="comp-topo"><p>Comprovante de agendamento</p><strong>' + esc(a.protocolo) + '</strong></header>' +
      '<dl class="comp-dados">' + linha('Paciente', a.paciente) + linha('Tipo de atendimento', a.tipo + (a.vacina ? ' — ' + a.vacina : '')) +
      linha('Unidade de saúde', a.unidade) + linha('Comunidade de origem', a.comunidade) +
      linha('Distância aproximada', a.distancia + ' km (' + a.tempo + ' min, simulado)') +
      linha('Data', fmtData(a.data)) + linha('Turno', a.turno) + linha('Deslocamento', a.transporte) +
      linha('Situação', st.icone + ' ' + st.rotulo) + '</dl>' +
      '<div class="comp-orient"><h3>Orientações de deslocamento</h3><p>Organize a viagem com antecedência e chegue cerca de 20 minutos antes.</p>' +
      '<h3>Documentos necessários</h3><ul>' + (DOCS[a.tipo] || BASE).map(d => '<li>' + esc(d) + '</li>').join('') + '</ul></div>' +
      '<p class="comp-aviso">Agendamento simulado para demonstração. Não é confirmação real de unidade de saúde.</p>';
    $('area-comprovante').hidden = false;
    $('copia-manual').hidden = true;
    if (rolar) { $('area-comprovante').scrollIntoView({ behavior: 'smooth', block: 'start' }); $('titulo-comprovante').focus(); }
  }

  function copiar() {
    const texto = textoComprovante(mostrado);
    const ok = () => SP.toast('Comprovante copiado. Agora é só colar onde quiser.');
    const manual = () => {
      $('copia-manual').hidden = false;
      const ta = $('texto-manual'); ta.value = texto; ta.focus(); ta.select();
      try { if (document.execCommand('copy')) { ok(); return; } } catch (e) { /* segue para cópia manual */ }
      SP.toast('Não foi possível copiar automaticamente. Selecione o texto e use Ctrl+C.');
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texto).then(ok, manual);
    else manual();
  }

  /* ---------- Histórico ---------- */
  function renderHistorico() {
    const ags = SP.obterAgendamentos().sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
    $('lista-historico').innerHTML = !ags.length
      ? '<p class="vazio">Você ainda não tem agendamentos. Preencha o formulário acima para criar o primeiro.</p>'
      : ags.map(a => {
        const st = SP.statusAgendamento(a);
        const podeCancelar = a.status === 'Confirmado' && a.data >= SP.hoje();
        return '<article class="card registro n-' + st.nivel + '"><header><h3>' + esc(a.protocolo) + '</h3>' +
          '<span class="badge b-' + st.nivel + '">' + st.icone + ' ' + esc(st.rotulo) + '</span></header>' +
          '<dl class="dados"><div><dt>Data</dt><dd>' + fmtData(a.data) + ' · ' + esc(a.turno) + '</dd></div>' +
          '<div><dt>Unidade</dt><dd>' + esc(a.unidade) + '</dd></div>' +
          '<div><dt>Atendimento</dt><dd>' + esc(a.tipo) + '</dd></div></dl>' +
          '<div class="acoes"><button class="btn btn-sec" data-acao="ver" data-p="' + esc(a.protocolo) + '">Ver comprovante</button>' +
          (podeCancelar ? '<button class="btn btn-perigo" data-acao="cancelar" data-p="' + esc(a.protocolo) + '">Cancelar agendamento</button>' : '') + '</div></article>';
      }).join('');
  }

  $('lista-historico').addEventListener('click', e => {
    const b = e.target.closest('button[data-acao]');
    if (!b) return;
    const a = SP.obterAgendamentos().find(x => x.protocolo === b.dataset.p);
    if (!a) return;
    if (b.dataset.acao === 'ver') mostrarComprovante(a, true);
    else if (window.confirm('Cancelar o agendamento ' + a.protocolo + '?')) {
      SP.cancelarAgendamento(a.protocolo);
      renderHistorico();
      if (mostrado && mostrado.protocolo === a.protocolo) mostrarComprovante(SP.obterAgendamentos().find(x => x.protocolo === a.protocolo), false);
      SP.toast('Agendamento ' + a.protocolo + ' cancelado.');
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validar()) return;
    if (unidadeMovelIdParam) {
      const unidade = SP.obterUnidadeMovel(unidadeMovelIdParam);
      if (!unidade || unidade.vagas <= 0) {
        SP.toast('Não há vagas disponíveis para esta unidade. Consulte outras datas ou unidades próximas.');
        return;
      }
      if (!SP.reservarVagaRadar(unidadeMovelIdParam)) return;
    }
    const rota = SP.obterRota($('comunidade').value, $('unidade').value);
    const distancia = rota ? rota.km : 25;
    const tempo = rota ? rota.min : 40;
    const ag = SP.salvarAgendamento({
      paciente: $('paciente').value.trim(), comunidade: $('comunidade').value, distancia: distancia, tempo: tempo,
      unidade: $('unidade').value, tipo: $('tipo').value, data: $('data').value,
      turno: form.querySelector('input[name="turno"]:checked').value, transporte: $('transporte').value, vacina: vacinaParam,
      unidadeMovelId: unidadeMovelIdParam
    });
    renderHistorico();
    mostrarComprovante(ag, true);
    SP.toast('Agendamento registrado! Protocolo ' + ag.protocolo + '.');
    form.reset();
    preencherPadroes();
  });
  $('comunidade').addEventListener('change', () => { popularUnidades(); atualizarPlano(); });
  $('unidade').addEventListener('change', atualizarPlano);
  $('btn-copiar').addEventListener('click', copiar);
  $('btn-imprimir').addEventListener('click', () => window.print());

  opcoes($('comunidade'), Object.keys(SP.ROTAS).map(c => ({ v: c, t: c })), 'Selecione a comunidade');
  preencherPadroes();
  renderHistorico();
})();
