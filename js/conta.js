(function () {
  'use strict';
  const sair = function () { SP.sair(); location.replace('login.html'); };
  document.getElementById('sair-conta').addEventListener('click', sair);
})();
