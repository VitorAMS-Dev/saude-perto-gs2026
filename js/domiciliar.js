(function () {
  'use strict';
  const dados = SP.obterDomicilio();
  const esc = SP.esc, fmtData = SP.fmtData;
  const proxima = dados.proxima;
  document.getElementById('card-visita').innerHTML =
    '<article class="card visita-principal"><div class="visita-data"><span>' + fmtData(proxima.data).split('/')[0] + '</span><small>' + fmtData(proxima.data).slice(3) + '</small></div>' +
    '<div class="visita-info"><div class="visita-cabecalho"><div><p class="tipo-unidade">' + esc(proxima.tipo) + '</p><h3>' + esc(proxima.equipe) + '</h3></div><span class="badge b-verde">✔ ' + esc(proxima.status) + '</span></div>' +
    '<dl class="dados"><div><dt>Horário previsto</dt><dd>' + esc(proxima.horario) + '</dd></div><div><dt>Comunidade</dt><dd>' + esc(proxima.comunidade) + '</dd></div>' +
    '<div><dt>UBS responsável</dt><dd>' + esc(proxima.ubs) + '</dd></div></dl></div></article>';
  document.getElementById('lista-visitas').innerHTML = dados.historico.map(v =>
    '<article class="card"><header><h3>' + esc(v.tipo) + '</h3><span class="badge b-verde">✔ ' + esc(v.status) + '</span></header>' +
    '<dl class="dados"><div><dt>Data</dt><dd>' + fmtData(v.data) + '</dd></div><div><dt>Equipe ou profissional</dt><dd>' + esc(v.equipe) + '</dd></div></dl>' +
    '<p class="observacao"><strong>Observações:</strong> ' + esc(v.observacoes) + '</p></article>'
  ).join('');
})();
