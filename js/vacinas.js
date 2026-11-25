/* Saúde Perto — carteira de vacinação, filtros, campanhas e ações. */
(function () {
  'use strict';
  const lista = document.getElementById('lista-vacinas');
  if (!lista) return;
  const { esc, fmtData } = SP;
  let filtro = 'todas';

  /* Cada filtro decide se a vacina aparece, usando a situação salva e o alerta calculado. */
  const FILTROS = {
    todas: () => true,
    aplicadas: v => v.situacao === 'aplicada',
    pendentes: v => v.situacao === 'pendente',
    reforco: (v, s) => s.codigo === 'reforco'
  };

  function badge(s) { return '<span class="badge b-' + s.nivel + '">' + s.icone + ' ' + esc(s.rotulo) + '</span>'; }

  function renderCarteira() {
    const vs = SP.obterVacinas().map(v => ({ v, s: SP.statusVacina(v) }));
    document.querySelectorAll('.filtro').forEach(b => {
      const k = b.dataset.filtro;
      b.setAttribute('aria-pressed', k === filtro ? 'true' : 'false');
      b.querySelector('span').textContent = vs.filter(x => FILTROS[k](x.v, x.s)).length;
    });
    const vis = vs.filter(x => FILTROS[filtro](x.v, x.s));
    if (!vis.length) { lista.innerHTML = '<p class="vazio">Nenhuma vacina neste filtro.</p>'; return; }
    lista.innerHTML = vis.map(({ v, s }) => {
      const acoes = v.situacao === 'pendente' || s.codigo === 'reforco' || s.codigo === 'atrasado'
        ? '<div class="acoes"><button class="btn" data-acao="agendar" data-id="' + v.id + '">Agendar esta vacina</button>' +
          '<button class="btn btn-sec" data-acao="tomada" data-id="' + v.id + '">Marcar como tomada</button></div>' : '';
      return '<article class="card vacina n-' + s.nivel + '"><header><h3>' + esc(v.nome) + '</h3>' + badge(s) + '</header>' +
        '<dl class="dados"><div><dt>Dose</dt><dd>' + v.dose + 'ª dose</dd></div>' +
        '<div><dt>Data da aplicação</dt><dd>' + (v.dataAplicacao ? fmtData(v.dataAplicacao) : 'Ainda não aplicada') + '</dd></div>' +
        '<div><dt>Lote (demonstrativo)</dt><dd>' + esc(v.lote) + '</dd></div>' +
        '<div><dt>Próxima data recomendada</dt><dd>' + (v.proximaData ? fmtData(v.proximaData) : 'Não se aplica') + '</dd></div></dl>' + acoes + '</article>';
    }).join('');
  }

  function renderCampanhas() {
    const box = document.getElementById('lista-campanhas');
    const cs = SP.obterCampanhas();
    box.innerHTML = !cs.length ? '<p class="vazio">Nenhuma campanha cadastrada.</p>' : cs.map(c => {
      const s = SP.statusCampanha(c);
      return '<article class="card campanha n-' + s.nivel + '"><header><h3>' + esc(c.nome) + '</h3>' +
        '<span class="badge b-' + s.nivel + '">' + s.icone + ' ' + esc(s.rotulo) + '</span></header>' +
        '<p>' + esc(c.descricao) + '</p>' +
        '<dl class="dados"><div><dt>Público-alvo</dt><dd>' + esc(c.publico) + '</dd></div>' +
        '<div><dt>Início</dt><dd>' + fmtData(c.inicio) + '</dd></div>' +
        '<div><dt>Encerramento</dt><dd>' + fmtData(c.fim) + '</dd></div>' +
        '<div><dt>Unidade</dt><dd>' + esc(c.unidade) + '</dd></div></dl></article>';
    }).join('');
  }

  document.querySelectorAll('.filtro').forEach(b => b.addEventListener('click', () => { filtro = b.dataset.filtro; renderCarteira(); }));

  lista.addEventListener('click', e => {
    const b = e.target.closest('button[data-acao]');
    if (!b) return;
    const v = SP.obterVacinas().find(x => x.id === b.dataset.id);
    if (!v) return;
    if (b.dataset.acao === 'agendar') {
      location.href = 'agendar.html?tipo=' + encodeURIComponent('Vacinação') + '&vacina=' + encodeURIComponent(v.nome);
    } else if (window.confirm('Marcar "' + v.nome + '" como tomada? Este registro é simulado e não substitui a carteira oficial do SUS.')) {
      SP.marcarVacinaTomada(v.id);
      renderCarteira();
      SP.toast(v.nome + ' registrada como tomada (simulação).');
    }
  });

  renderCarteira();
  renderCampanhas();
})();
