/* Saúde Perto — camada de dados compartilhada entre as três páginas (LocalStorage).
   Todos os dados são FICTÍCIOS e servem apenas para demonstração. */
(function (global) {
  'use strict';

  const CHAVE = 'saudePerto.dados.v1';
  let estado = null;
  let armazenamentoOk = true;

  /* Rotas demonstrativas: distância e tempo NÃO são navegação em tempo real. */
  const ROTAS = {
    'Rio Verde': [
      { unidade: 'UBS Central', km: 38, min: 55 },
      { unidade: 'Posto de Saúde Serra Azul', km: 24, min: 40 }
    ],
    'Vale do Sol': [
      { unidade: 'UBS Vale do Sol', km: 12, min: 20 },
      { unidade: 'UBS Central', km: 29, min: 45 }
    ],
    'Serra Alta': [
      { unidade: 'Posto de Saúde Serra Azul', km: 17, min: 30 },
      { unidade: 'UBS Central', km: 52, min: 80 }
    ],
    'Barra Seca': [
      { unidade: 'UBS Vale do Sol', km: 41, min: 65 },
      { unidade: 'UBS Central', km: 64, min: 100 }
    ]
  };

  /* ---------- Datas (sempre em formato ISO aaaa-mm-dd, horário local) ---------- */
  const pad = n => (n < 10 ? '0' + n : '' + n);
  const paraIso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const paraData = iso => { const p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0); };
  const hoje = () => paraIso(new Date());
  const addDias = (iso, n) => { const d = paraData(iso); d.setDate(d.getDate() + n); return paraIso(d); };
  const diffDias = (a, b) => Math.round((paraData(a) - paraData(b)) / 86400000); // a - b em dias
  const fmtData = iso => { if (!iso) return '—'; const p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Dados demonstrativos (datas relativas ao dia da primeira abertura) ---------- */
  function criarSeed() {
    const h = hoje();
    return {
      usuario: { nome: 'Maria Oliveira', comunidade: 'Rio Verde', distancia: 38, unidade: 'UBS Central' },
      agendamentos: [{
        protocolo: 'SP-2026-0412', paciente: 'Maria Oliveira', comunidade: 'Rio Verde', distancia: 38, tempo: 55,
        unidade: 'UBS Central', tipo: 'Consulta médica', data: addDias(h, 6), turno: 'Manhã',
        transporte: 'Transporte comunitário', vacina: '', status: 'Confirmado', criadoEm: new Date().toISOString()
      }],
      vacinas: [
        { id: 'influenza', nome: 'Influenza', dose: 1, lote: 'DEMO-INF-0001', situacao: 'pendente', dataAplicacao: null, proximaData: addDias(h, -3) },
        { id: 'hepatite-b', nome: 'Hepatite B', dose: 3, lote: 'DEMO-HEB-0207', situacao: 'aplicada', dataAplicacao: addDias(h, -200), proximaData: null },
        { id: 'febre-amarela', nome: 'Febre Amarela', dose: 1, lote: 'DEMO-FAM-0933', situacao: 'aplicada', dataAplicacao: addDias(h, -3500), proximaData: addDias(h, 20) },
        { id: 'antitetanica', nome: 'Antitetânica', dose: 2, lote: 'DEMO-ATT-0558', situacao: 'aplicada', dataAplicacao: addDias(h, -400), proximaData: addDias(h, 300) }
      ],
      campanhas: [
        { id: 'c-influenza', nome: 'Campanha de vacinação contra Influenza', descricao: 'Vacinação demonstrativa contra a gripe para a comunidade.', publico: 'Adultos e idosos (demonstrativo)', inicio: addDias(h, -20), fim: addDias(h, 5), unidade: 'UBS Central' },
        { id: 'c-caderneta', nome: 'Atualização da caderneta vacinal', descricao: 'Leve sua caderneta e confira quais doses estão em dia.', publico: 'Todas as idades (demonstrativo)', inicio: addDias(h, -5), fim: addDias(h, 40), unidade: 'UBS Vale do Sol' },
        { id: 'c-prevencao', nome: 'Campanha de prevenção e vacinação', descricao: 'Ação de prevenção com atendimento itinerante (já encerrada).', publico: 'Famílias da zona rural (demonstrativo)', inicio: addDias(h, -60), fim: addDias(h, -10), unidade: 'Posto de Saúde Serra Azul' }
      ],
      unidadesMoveis: [
        {
          id: 'saude-01', nome: 'Unidade Móvel Saúde 01', tipo: 'Van de atendimento', categoria: 'vans',
          comunidade: 'Rio Verde', parada: 'UBS Comunitária Rio Verde', data: addDias(h, 1), horario: '08h às 12h',
          servicos: ['Consulta médica', 'Vacinação'], vagas: 12, status: 'Confirmado',
          coordenadas: { x: 27, y: 34 }, comunidades: ['Rio Verde', 'Vila Esperança', 'Santa Luzia', 'Nova Vida'],
          rota: [
            { comunidade: 'Rio Verde', horario: '08h00' }, { comunidade: 'Vila Esperança', horario: '10h00' },
            { comunidade: 'Santa Luzia', horario: '13h30' }, { comunidade: 'Nova Vida', horario: '15h30' }
          ]
        },
        {
          id: 'saude-02', nome: 'Unidade Fluvial Saúde 02', tipo: 'Barco de atendimento', categoria: 'barcos',
          comunidade: 'Comunidade das Águas', parada: 'Porto Comunitário', data: addDias(h, 2), horario: '09h às 14h',
          servicos: ['Atendimento básico', 'Vacinação'], vagas: 8, status: 'Em deslocamento',
          coordenadas: { x: 70, y: 27 }, comunidades: ['Comunidade das Águas', 'Ilha do Cedro', 'Praia Grande'],
          rota: [
            { comunidade: 'Comunidade das Águas', horario: '09h00' }, { comunidade: 'Ilha do Cedro', horario: '11h30' },
            { comunidade: 'Praia Grande', horario: '13h30' }
          ]
        },
        {
          id: 'saude-03', nome: 'Mutirão Saúde 03', tipo: 'Equipe volante', categoria: 'mutiroes',
          comunidade: 'Vila Esperança', parada: 'Praça Central', data: addDias(h, 3), horario: '07h30 às 16h',
          servicos: ['Avaliação médica', 'Prevenção'], vagas: 0, status: 'Vagas encerradas',
          coordenadas: { x: 48, y: 68 }, comunidades: ['Vila Esperança', 'Campo Alegre'],
          rota: [
            { comunidade: 'Vila Esperança', horario: '07h30' }, { comunidade: 'Campo Alegre', horario: '12h00' }
          ]
        },
        {
          id: 'saude-04', nome: 'Vacinação Itinerante 04', tipo: 'Unidade móvel de vacinação', categoria: 'vans',
          comunidade: 'Serra Alta', parada: 'Centro Comunitário Serra Alta', data: addDias(h, 5), horario: '08h30 às 15h',
          servicos: ['Vacinação', 'Atualização da caderneta'], vagas: 20, status: 'Confirmado',
          coordenadas: { x: 82, y: 63 }, comunidades: ['Serra Alta', 'Vale do Sol'],
          rota: [
            { comunidade: 'Serra Alta', horario: '08h30' }, { comunidade: 'Vale do Sol', horario: '12h30' }
          ]
        }
      ],
      emergencias: [],
      domicilio: {
        proxima: {
          id: 'dv-001',
          data: addDias(h, 4),
          horario: '09h30',
          equipe: 'Equipe de Saúde Domiciliar 01',
          tipo: 'Acompanhamento de saúde',
          comunidade: 'Rio Verde',
          ubs: 'UBS Central',
          status: 'Confirmada'
        },
        historico: [
          { id: 'dv-101', data: addDias(h, -14), tipo: 'Visita de enfermagem', equipe: 'Equipe de Saúde Domiciliar 02', status: 'Atendimento realizado', observacoes: 'Verificação de sinais vitais e orientações sobre medicamentos.' },
          { id: 'dv-102', data: addDias(h, -35), tipo: 'Acompanhamento de saúde', equipe: 'Equipe de Saúde Domiciliar 01', status: 'Atendimento realizado', observacoes: 'Acompanhamento realizado. Próxima visita mantida pelo cadastro da equipe.' }
        ]
      },
      prefs: { modoLeve: false }
    };
  }

  /* ---------- Leitura e escrita com tratamento de erro ---------- */
  function ler() {
    try {
      const bruto = global.localStorage.getItem(CHAVE);
      if (bruto) {
        const o = JSON.parse(bruto);
        if (o && Array.isArray(o.agendamentos) && Array.isArray(o.vacinas) && Array.isArray(o.campanhas)) return o;
      }
    } catch (e) { armazenamentoOk = false; }
    return null;
  }
  function gravar() {
    try { global.localStorage.setItem(CHAVE, JSON.stringify(estado)); }
    catch (e) { armazenamentoOk = false; }
  }
  /* Regra: só cria os dados demonstrativos se NÃO houver registros salvos. */
  function inicializar() {
    if (estado) return estado;
    estado = ler();
    if (!estado) { estado = criarSeed(); gravar(); }
    if (!estado.prefs) estado.prefs = { modoLeve: false };
    if (!Array.isArray(estado.unidadesMoveis)) {
      estado.unidadesMoveis = criarSeed().unidadesMoveis;
      gravar();
    }
    if (!Array.isArray(estado.emergencias)) { estado.emergencias = []; gravar(); }
    if (!estado.domicilio) { estado.domicilio = criarSeed().domicilio; gravar(); }
    return estado;
  }

  /* ---------- Agendamentos ---------- */
  const obterAgendamentos = () => inicializar().agendamentos.slice();
  function novoProtocolo() {
    const usados = {};
    inicializar().agendamentos.forEach(a => { usados[a.protocolo] = true; });
    let p;
    do { p = 'SP-2026-' + ('000' + Math.floor(Math.random() * 10000)).slice(-4); } while (usados[p]);
    return p;
  }
  function salvarAgendamento(dados) {
    const ag = Object.assign({}, dados, { protocolo: novoProtocolo(), status: 'Confirmado', criadoEm: new Date().toISOString() });
    inicializar().agendamentos.push(ag);
    gravar();
    return ag;
  }
  function cancelarAgendamento(protocolo) {
    const ag = inicializar().agendamentos.find(a => a.protocolo === protocolo);
    if (!ag) return false;
    ag.status = 'Cancelado';
    if (ag.unidadeMovelId) {
      const u = inicializar().unidadesMoveis.find(x => x.id === ag.unidadeMovelId);
      if (u) {
        u.vagas += 1;
        if (u.status === 'Vagas encerradas') u.status = 'Confirmado';
      }
    }
    gravar();
    return true;
  }
  function statusAgendamento(a) {
    if (a.status === 'Cancelado') return { rotulo: 'Cancelado', nivel: 'vermelho', icone: '✖' };
    if (a.data < hoje()) return { rotulo: 'Concluído', nivel: 'verde', icone: '✔' };
    return { rotulo: 'Confirmado (simulado)', nivel: 'verde', icone: '✔' };
  }
  /* Próximo atendimento = confirmado, com data de hoje em diante, o mais cedo. */
  function proximoAtendimento() {
    const h = hoje();
    return inicializar().agendamentos
      .filter(a => a.status === 'Confirmado' && a.data >= h)
      .sort((a, b) => (a.data < b.data ? -1 : 1))[0] || null;
  }

  /* ---------- Vacinas e campanhas ---------- */
  const obterVacinas = () => inicializar().vacinas.slice();
  const obterCampanhas = () => inicializar().campanhas.slice();
  function atualizarVacina(id, campos) {
    const v = inicializar().vacinas.find(x => x.id === id);
    if (!v) return false;
    Object.assign(v, campos);
    gravar();
    return true;
  }
  /* "Marcar como tomada": registro simulado com a data de hoje. */
  function marcarVacinaTomada(id) {
    const v = inicializar().vacinas.find(x => x.id === id);
    if (!v) return false;
    return atualizarVacina(id, {
      situacao: 'aplicada', dataAplicacao: hoje(),
      dose: v.situacao === 'aplicada' ? v.dose + 1 : v.dose, proximaData: null
    });
  }

  /* Regras de alerta de vacina (comparam as datas fictícias com a data do navegador):
     - pendente: prazo vencido = vermelho; prazo futuro = amarelo
     - aplicada com próxima data: vencida = vermelho; até 45 dias = amarelo; senão verde
     - aplicada sem próxima data: verde */
  function statusVacina(v) {
    const h = hoje();
    if (v.situacao === 'pendente') {
      const venc = v.proximaData && diffDias(v.proximaData, h) < 0;
      return venc ? { codigo: 'pendente', nivel: 'vermelho', icone: '✖', rotulo: 'Dose pendente (prazo vencido)' }
                  : { codigo: 'pendente', nivel: 'amarelo', icone: '!', rotulo: 'Dose pendente' };
    }
    if (v.proximaData) {
      const d = diffDias(v.proximaData, h);
      if (d < 0) return { codigo: 'atrasado', nivel: 'vermelho', icone: '✖', rotulo: 'Reforço atrasado' };
      if (d <= 45) return { codigo: 'reforco', nivel: 'amarelo', icone: '!', rotulo: 'Reforço próximo' };
      return { codigo: 'em-dia', nivel: 'verde', icone: '✔', rotulo: 'Em dia' };
    }
    return { codigo: 'registrada', nivel: 'verde', icone: '✔', rotulo: 'Vacinação registrada' };
  }
  function statusCampanha(c) {
    const h = hoje();
    if (diffDias(c.inicio, h) > 0) return { codigo: 'breve', nivel: 'amarelo', icone: '!', rotulo: 'Começa em breve', dias: 0 };
    const d = diffDias(c.fim, h);
    if (d < 0) return { codigo: 'encerrada', nivel: 'vermelho', icone: '✖', rotulo: 'Encerrada', dias: d };
    if (d <= 7) return { codigo: 'encerrando', nivel: 'amarelo', icone: '!', rotulo: d === 0 ? 'Encerra hoje' : 'Encerra em ' + d + (d === 1 ? ' dia' : ' dias'), dias: d };
    return { codigo: 'ativa', nivel: 'verde', icone: '✔', rotulo: 'Ativa', dias: d };
  }

  /* ---------- Radar de atendimento itinerante ---------- */
  const obterUnidadesMoveis = () => inicializar().unidadesMoveis.slice();
  function obterUnidadeMovel(id) {
    return inicializar().unidadesMoveis.find(u => u.id === id) || null;
  }
  function atualizarUnidadeMovel(id, campos) {
    const u = inicializar().unidadesMoveis.find(x => x.id === id);
    if (!u) return false;
    Object.assign(u, campos);
    gravar();
    return true;
  }
  function statusUnidadeMovel(u) {
    if (u.status === 'Vagas encerradas' || u.vagas <= 0) {
      return { codigo: 'encerradas', nivel: 'vermelho', icone: '✖', rotulo: 'Vagas encerradas', filtro: 'vagas-encerradas' };
    }
    if (u.status === 'Em deslocamento') {
      return { codigo: 'deslocamento', nivel: 'azul', icone: '→', rotulo: 'Em deslocamento', filtro: 'em-deslocamento' };
    }
    return { codigo: 'confirmado', nivel: 'verde', icone: '✔', rotulo: 'Confirmado', filtro: 'confirmados' };
  }
  function reservarVagaRadar(id) {
    const u = obterUnidadeMovel(id);
    if (!u || u.vagas <= 0) return false;
    u.vagas -= 1;
    if (u.vagas === 0) u.status = 'Vagas encerradas';
    gravar();
    return true;
  }
  function proximaUnidadeMovel() {
    const h = hoje();
    return obterUnidadesMoveis()
      .filter(u => u.data >= h)
      .sort((a, b) => (a.data < b.data ? -1 : 1))[0] || null;
  }

  /* ---------- Sessão, emergência e atendimento domiciliar ---------- */
  const SESSAO = 'saudePerto.sessao.v1';
  function loginDemonstrativo(usuario, senha) {
    if (usuario.trim().toLowerCase() !== 'paciente' || senha !== '123456') return false;
    try { global.sessionStorage.setItem(SESSAO, JSON.stringify({ usuario: 'paciente', nome: 'Maria Oliveira', conectadoEm: new Date().toISOString() })); }
    catch (e) { armazenamentoOk = false; }
    return true;
  }
  function obterSessao() {
    try { return JSON.parse(global.sessionStorage.getItem(SESSAO)) || null; } catch (e) { return null; }
  }
  function sair() {
    try { global.sessionStorage.removeItem(SESSAO); } catch (e) {}
  }
  function protegerPagina() {
    const nome = (global.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (nome !== 'login.html' && !obterSessao()) {
      const login = global.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
      global.location.replace(login);
      return false;
    }
    return true;
  }
  const obterEmergencias = () => inicializar().emergencias.slice();
  function obterEmergenciaAtual() {
    return obterEmergencias()
      .filter(e => e.status !== 'Solicitação cancelada')
      .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))[0] || null;
  }
  function novoProtocoloEmergencia() {
    let n;
    do { n = 'EM-' + String(Math.floor(10000 + Math.random() * 90000)); } while (obterEmergencias().some(e => e.protocolo === n));
    return n;
  }
  function salvarEmergencia(dados) {
    const registro = Object.assign({}, dados, {
      protocolo: novoProtocoloEmergencia(), criadoEm: new Date().toISOString(),
      dataSolicitacao: hoje(), posicaoFila: 3, status: 'Aguardando atendimento',
      previsao: '20 a 35 minutos'
    });
    inicializar().emergencias.push(registro);
    atualizarFilaEmergencias();
    gravar();
    return registro;
  }
  function podeCancelarEmergencia(registro) {
    return !!registro && (registro.status === 'Solicitação enviada' || registro.status === 'Aguardando atendimento');
  }
  function atualizarFilaEmergencias() {
    const ativos = inicializar().emergencias
      .filter(e => podeCancelarEmergencia(e))
      .sort((a, b) => (a.criadoEm < b.criadoEm ? -1 : 1));
    ativos.forEach((e, i) => { e.posicaoFila = i + 1; });
  }
  function cancelarEmergencia(protocolo) {
    const registro = inicializar().emergencias.find(e => e.protocolo === protocolo);
    if (!podeCancelarEmergencia(registro)) return false;
    const agora = new Date();
    registro.status = 'Solicitação cancelada';
    registro.posicaoFila = null;
    registro.canceladoEm = agora.toISOString();
    registro.dataCancelamento = hoje();
    registro.horarioCancelamento = String(agora.getHours()).padStart(2, '0') + 'h' + String(agora.getMinutes()).padStart(2, '0');
    atualizarFilaEmergencias();
    gravar();
    return true;
  }
  const obterDomicilio = () => JSON.parse(JSON.stringify(inicializar().domicilio));

  /* Notificações dinâmicas da Home, geradas a partir dos dados salvos. */
  function gerarAlertas() {
    const al = [];
    const emPages = global.location.pathname.includes('/pages/');
    const caminho = nome => emPages ? nome : 'pages/' + nome;
    const emerg = obterEmergenciaAtual();
    if (emerg && emerg.status !== 'Solicitação cancelada') al.push({ nivel: 'amarelo', texto: 'Sua solicitação de emergência está em ' + emerg.status.toLowerCase() + '. Protocolo ' + emerg.protocolo + '.', acao: { href: caminho('emergencia.html'), texto: 'Acompanhar solicitação' } });
    const prox = proximoAtendimento();
    if (prox) al.push({ nivel: 'verde', texto: 'Seu atendimento está confirmado: ' + prox.tipo + ' em ' + fmtData(prox.data) + ' na ' + prox.unidade + ' (protocolo ' + prox.protocolo + ').' });
    obterVacinas().forEach(v => {
      const s = statusVacina(v);
      const acao = { href: caminho('agendar.html') + '?tipo=' + encodeURIComponent('Vacinação') + '&vacina=' + encodeURIComponent(v.nome), texto: 'Agendar esta vacina' };
      if (s.codigo === 'reforco') al.push({ nivel: 'amarelo', texto: 'Você possui uma dose de reforço próxima: ' + v.nome + ' (até ' + fmtData(v.proximaData) + ').', acao });
      else if (s.codigo === 'atrasado') al.push({ nivel: 'vermelho', texto: 'O reforço de ' + v.nome + ' está atrasado desde ' + fmtData(v.proximaData) + '.', acao });
      else if (s.codigo === 'pendente') al.push({ nivel: s.nivel, texto: 'Dose pendente de ' + v.nome + (s.nivel === 'vermelho' ? ': o prazo recomendado já passou.' : '.'), acao });
    });
    obterCampanhas().forEach(c => {
      const s = statusCampanha(c);
      if (s.codigo === 'encerrando') al.push({ nivel: 'amarelo', texto: 'A campanha "' + c.nome + '" termina em breve (' + fmtData(c.fim) + ').' });
    });
    al.push({ nivel: 'verde', texto: 'Confira os documentos necessários antes de sair de casa: documento com foto, Cartão Nacional de Saúde e caderneta de vacinação.' });
    const ordem = { vermelho: 0, amarelo: 1, verde: 2 };
    return al.sort((a, b) => ordem[a.nivel] - ordem[b.nivel]);
  }

  /* ---------- Preferências e Modo Conexão Fraca ---------- */
  const obterPreferencias = () => inicializar().prefs;
  function salvarPreferencia(chave, valor) { inicializar().prefs[chave] = valor; gravar(); }

  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    t.className = 'toast no-print';
    t.textContent = msg;
    void t.offsetWidth;
    t.classList.add('visivel');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('visivel'), 6000);
  }

  function aplicarModoLeve(ativo) {
    document.body.classList.toggle('modo-leve', ativo);
    const b = document.getElementById('btn-modo');
    if (b) { b.setAttribute('aria-pressed', ativo ? 'true' : 'false'); b.classList.toggle('ativo', ativo); }
  }

  function iniciarInterface() {
    aplicarModoLeve(!!obterPreferencias().modoLeve);
    const b = document.getElementById('btn-modo');
    if (b) {
      b.innerHTML = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 17h16M7 13h10M10 9h4"/><path d="M9 21h6"/></svg><span class="modo-texto">Conexão fraca</span>';
      b.title = obterPreferencias().modoLeve ? 'Desativar modo conexão fraca' : 'Ativar modo conexão fraca';
      b.setAttribute('aria-label', b.title);
      b.addEventListener('click', () => {
      const novo = !obterPreferencias().modoLeve;
      salvarPreferencia('modoLeve', novo);
      aplicarModoLeve(novo);
      b.title = novo ? 'Desativar modo conexão fraca' : 'Ativar modo conexão fraca';
      b.setAttribute('aria-label', b.title);
      toast(novo ? 'Modo Conexão Fraca ativado. Seus dados salvos continuam disponíveis neste aparelho.' : 'Modo Conexão Fraca desativado.');
      });
    }
    const m = document.getElementById('btn-menu');
    const menu = document.getElementById('menu');
    if (m && menu) {
      const emergencia = menu.querySelector('a[href="emergencia.html"]');
      if (emergencia) emergencia.classList.add('menu-emergencia');
      m.addEventListener('click', () => {
      const aberto = menu.classList.toggle('aberto');
      m.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      });
    }
    const sairBotao = document.getElementById('btn-sair');
    if (sairBotao) sairBotao.addEventListener('click', () => {
      sair();
      global.location.replace(global.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html');
    });
    if (!armazenamentoOk) toast('Não foi possível usar o armazenamento do navegador. Os dados valem apenas nesta visita.');
  }

  inicializar();
  protegerPagina();
  global.SP = {
    ROTAS, hoje, addDias, diffDias, fmtData, esc, toast, inicializar,
    obterDados: () => inicializar(), obterUsuario: () => inicializar().usuario,
    obterRota: (c, u) => (ROTAS[c] || []).find(r => r.unidade === u) || null,
    obterAgendamentos, salvarAgendamento, cancelarAgendamento, statusAgendamento, proximoAtendimento,
    obterVacinas, obterCampanhas, atualizarVacina, marcarVacinaTomada, statusVacina, statusCampanha,
    obterUnidadesMoveis, obterUnidadeMovel, atualizarUnidadeMovel, statusUnidadeMovel, reservarVagaRadar, proximaUnidadeMovel,
    gerarAlertas, obterPreferencias, salvarPreferencia
    , loginDemonstrativo, obterSessao, sair, protegerPagina,
    obterEmergencias, obterEmergenciaAtual, salvarEmergencia, podeCancelarEmergencia,
    cancelarEmergencia, atualizarFilaEmergencias, obterDomicilio
  };
  iniciarInterface();
})(window);
