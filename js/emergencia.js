(function () {
  'use strict';
  const form = document.getElementById('form-emergencia');
  if (!form) return;
  const { esc, fmtData } = SP;
  const graves = ['Dor no peito', 'Falta de ar', 'Tontura ou desmaio'];
  function mostrarAlertaGrave() {
    const motivo = document.getElementById('em-motivo').value;
    document.getElementById('alerta-grave').hidden = !graves.includes(motivo);
  }
  document.getElementById('em-motivo').addEventListener('change', mostrarAlertaGrave);
  function renderAcompanhamento() {
    const atual = SP.obterEmergenciaAtual();
    const painel = document.getElementById('painel-emergencia');
    if (!atual) {
      form.hidden = false;
      painel.innerHTML = '<h2>Acompanhamento da solicitação</h2><p class="vazio">Nenhuma solicitação enviada. Preencha o formulário para receber um protocolo demonstrativo.</p>';
      return;
    }
    form.hidden = true;
    const cancelada = atual.status === 'Solicitação cancelada';
    const emAndamento = ['Em avaliação', 'Encaminhamento necessário', 'Atendimento finalizado'].includes(atual.status);
    const podeCancelar = SP.podeCancelarEmergencia(atual);
    const statusClasse = cancelada ? 'b-cinza' : emAndamento ? 'b-vermelho' : 'b-amarelo';
    const statusIcone = cancelada ? '—' : emAndamento ? '!' : '!';
    painel.innerHTML = '<h2>Acompanhamento da solicitação</h2>' +
      '<div class="protocolo-emergencia"><span>Protocolo</span><strong>' + esc(atual.protocolo) + '</strong></div>' +
      '<dl class="dados"><div><dt>Solicitada em</dt><dd>' + fmtData(atual.dataSolicitacao) + ' · ' + esc(atual.horarioSolicitacao) + '</dd></div>' +
      '<div><dt>Posição na fila</dt><dd>' + (cancelada || atual.posicaoFila == null ? 'Fora da fila ativa' : atual.posicaoFila + 'ª posição') + '</dd></div>' +
      '<div><dt>Status</dt><dd><span class="badge ' + statusClasse + '">' + statusIcone + ' ' + esc(atual.status) + '</span></dd></div>' +
      '<div><dt>Previsão simulada</dt><dd>' + esc(atual.previsao) + '</dd></div></dl>' +
      (cancelada
        ? '<p class="cancelamento-sucesso">Sua solicitação foi cancelada com sucesso.</p>' +
          '<dl class="dados"><div><dt>Cancelada em</dt><dd>' + fmtData(atual.dataCancelamento) + ' · ' + esc(atual.horarioCancelamento) + '</dd></div></dl>'
        : '') +
      '<div class="orientacoes-emergencia"><h3>Próximos passos</h3><ul><li>Aguarde a orientação demonstrativa.</li><li>Mantenha o telefone acessível.</li><li>Procure atendimento presencial imediatamente se houver piora.</li></ul></div>' +
      (podeCancelar
        ? '<button id="abrir-cancelar-emergencia" class="btn btn-perigo btn-secundario" type="button">Cancelar solicitação</button>'
        : emAndamento
          ? '<p class="aviso-cancelamento">O atendimento já foi iniciado. Nesta etapa, o cancelamento deve ser solicitado por outro canal de saúde.</p>'
          : '') +
      '<p class="aviso-mini">Esta fila não substitui atendimento presencial de urgência e não realiza diagnóstico nem acionamento real do SAMU.</p>';
  }
  document.getElementById('painel-emergencia').addEventListener('click', function (e) {
    if (!e.target.closest('#abrir-cancelar-emergencia')) return;
    document.getElementById('modal-cancelar-emergencia').hidden = false;
    document.getElementById('cancelar-modal-voltar').focus();
  });
  document.getElementById('cancelar-modal-voltar').addEventListener('click', function () {
    document.getElementById('modal-cancelar-emergencia').hidden = true;
  });
  document.getElementById('cancelar-modal-confirmar').addEventListener('click', function () {
    const atual = SP.obterEmergenciaAtual();
    if (!atual || !SP.cancelarEmergencia(atual.protocolo)) return;
    document.getElementById('modal-cancelar-emergencia').hidden = true;
    form.reset();
    document.getElementById('alerta-grave').hidden = true;
    renderAcompanhamento();
    SP.toast('Sua solicitação foi cancelada com sucesso');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.getElementById('modal-cancelar-emergencia').addEventListener('click', function (e) {
    if (e.target === this) this.hidden = true;
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.getElementById('modal-cancelar-emergencia').hidden = true;
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const ids = ['em-nome','em-cpf','em-nascimento','em-telefone','em-comunidade','em-ubs','em-motivo','em-sintomas','em-tempo','em-deslocamento'];
    let primeiro = null;
    ids.forEach(id => {
      const campo = document.getElementById(id);
      const valido = campo.value.trim();
      campo.setAttribute('aria-invalid', valido ? 'false' : 'true');
      if (!valido && !primeiro) primeiro = campo;
    });
    if (primeiro) { primeiro.focus(); SP.toast('Preencha os campos obrigatórios.'); return; }
    const motivo = document.getElementById('em-motivo').value;
    if (graves.includes(motivo)) { mostrarAlertaGrave(); }
    const agora = new Date();
    const registro = SP.salvarEmergencia({
      nome: document.getElementById('em-nome').value.trim(),
      cpf: document.getElementById('em-cpf').value.trim(),
      nascimento: document.getElementById('em-nascimento').value,
      telefone: document.getElementById('em-telefone').value.trim(),
      comunidade: document.getElementById('em-comunidade').value.trim(),
      ubs: document.getElementById('em-ubs').value,
      motivo: motivo,
      sintomas: document.getElementById('em-sintomas').value.trim(),
      tempo: document.getElementById('em-tempo').value.trim(),
      pressao: document.getElementById('em-pressao').value.trim(),
      informacoes: document.getElementById('em-infos').value.trim(),
      deslocamento: document.getElementById('em-deslocamento').value,
      horarioSolicitacao: String(agora.getHours()).padStart(2,'0') + 'h' + String(agora.getMinutes()).padStart(2,'0')
    });
    form.hidden = true;
    renderAcompanhamento();
    SP.toast('Solicitação registrada: protocolo ' + registro.protocolo + '.');
    document.getElementById('painel-emergencia').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  renderAcompanhamento();
})();
