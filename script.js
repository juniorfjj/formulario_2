// ATENÇÃO: cole aqui a URL do seu Google Apps Script depois de publicá-lo (ver GUIA-CONFIGURACAO.md)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyirsMuPRYpcZd8675xK6eeYAd_aW3nm_Re2X2s6JnsPdIAoiB6UiruVfnOHBqXtoA8w/exec";

const form = document.getElementById('surveyForm');
const btn = document.getElementById('submitBtn');
const msg = document.getElementById('msg');
const cidadeInput = document.getElementById('cidade');
const cidadeHint = document.getElementById('cidadeHint');
const cidadeError = document.getElementById('cidadeError');
const datalist = document.getElementById('cidades-pb');

// Normaliza texto para comparação (remove acentos e caixa)
function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

let cidadesPB = [];
let cidadesCarregadas = false;

// Busca a lista oficial de municípios da Paraíba direto na API do IBGE
fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/PB/municipios')
  .then(function (res) { return res.json(); })
  .then(function (data) {
    cidadesPB = data.map(function (m) { return m.nome; }).sort(function (a, b) {
      return a.localeCompare(b, 'pt-BR');
    });
    datalist.innerHTML = cidadesPB.map(function (nome) {
      return '<option value="' + nome + '"></option>';
    }).join('');
    cidadesCarregadas = true;
    cidadeHint.textContent = cidadesPB.length + ' municípios carregados. Comece a digitar e selecione uma opção.';
  })
  .catch(function () {
    cidadeHint.textContent = 'Não foi possível carregar a lista automática. Digite o nome da cidade com atenção à grafia.';
  });

function cidadeValida() {
  if (!cidadesCarregadas) return true; // não bloqueia se a lista não carregou
  const valor = normalize(cidadeInput.value);
  return cidadesPB.some(function (nome) { return normalize(nome) === valor; });
}

cidadeInput.addEventListener('input', function () {
  cidadeError.classList.remove('visible');
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  msg.className = 'msg hidden';

  if (!cidadeValida()) {
    cidadeError.classList.add('visible');
    cidadeInput.focus();
    return;
  }
  cidadeError.classList.remove('visible');

  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const formData = new FormData(form);
  const data = {
    nome: formData.get('nome'),
    telefone: formData.get('telefone'),
    instagram: formData.get('instagram') || '',
    cidade: formData.get('cidade'),
    cicero: formData.get('cicero'),
    mersinho: formData.get('mersinho'),
    hervazio: formData.get('hervazio'),
    veneziano: formData.get('veneziano'),
    dataHora: new Date().toISOString()
  };

  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(data)
  })
  .then(function () {
    msg.textContent = 'Respostas enviadas com sucesso. Obrigado!';
    msg.className = 'msg success';
    form.reset();
    form.classList.add('hidden');
    document.querySelector('h1').classList.add('hidden');
    document.querySelector('.subtitle').classList.add('hidden');
  })
  .catch(function () {
    msg.textContent = 'Erro ao enviar. Tente novamente.';
    msg.className = 'msg error';
    btn.disabled = false;
    btn.textContent = 'Enviar';
  });
});
