(function () {
  'use strict';
  const form = document.getElementById('form-login');
  if (!form) return;
  if (SP.obterSessao()) location.replace('../index.html');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    if (SP.loginDemonstrativo(usuario, senha)) {
      SP.toast('Bem-vinda, Maria Oliveira!');
      setTimeout(() => { location.replace('../index.html'); }, 300);
    } else {
      document.getElementById('erro-login').textContent = 'Usuário ou senha não conferem. Use paciente e 123456.';
    }
  });
  document.getElementById('esqueci-senha').addEventListener('click', function () {
    SP.toast('Em demonstração, use o usuário paciente e a senha 123456.');
  });
})();
