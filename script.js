// ATENÇÃO: cole aqui a URL do seu Google Apps Script depois de publicá-lo (ver GUIA-CONFIGURACAO.md)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyirsMuPRYpcZd8675xK6eeYAd_aW3nm_Re2X2s6JnsPdIAoiB6UiruVfnOHBqXtoA8w/exec";

const form = document.getElementById('surveyForm');
const btn = document.getElementById('submitBtn');
const msg = document.getElementById('msg');
const cidadeInput = document.getElementById('cidade');
const cidadeHint = document.getElementById('cidadeHint');
const cidadeError = document.getElementById('cidadeError');
const datalist = document.getElementById('cidades-pb');
const bairroWrapper = document.getElementById('bairroWrapper');
const bairroInput = document.getElementById('bairro');
const bairroDatalist = document.getElementById('bairros-jp');

// Normaliza texto para comparação (remove acentos e caixa)
function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

// ── Bairros de João Pessoa ───────────────────────────────────────────────────
const bairrosJP = [
  'Água Fria', 'Alto do Céu', 'Alto do Mateus', 'Altiplano Cabo Branco',
  'Anatólia', 'Bancários', 'Barra de Gramame', 'Bessa', 'Cabo Branco',
  'Castelo Branco I', 'Castelo Branco II', 'Castelo Branco III', 'Centro',
  'Cidade dos Colibris', 'Cidade Universitária', 'Costa e Silva',
  'Cristo Redentor', 'Cruz das Armas', 'Cuiá', 'Ernesto Geisel', 'Esplanada',
  'Expedicionários', 'Funcionários I', 'Funcionários II', 'Funcionários III',
  'Funcionários IV', 'Gramame', 'Grotão', 'Ilha do Bispo', 'Ipês',
  'Jaguaribe', 'Jardim Cidade Universitária', 'Jardim Mangueira',
  'Jardim Oceania', 'Jardim Planalto', 'Jardim São Paulo', 'João Agripino',
  'José Américo', 'Manaíra', 'Mangabeira I', 'Mangabeira II', 'Mangabeira III',
  'Mangabeira IV', 'Mangabeira V', 'Mangabeira VI', 'Mangabeira VII',
  'Mangabeira VIII', 'Miramar', 'Mussuré', 'Novais', 'Oitizeiro', 'Padre Zé',
  'Paratibe', 'Pedro Gondim', 'Penha', 'Planalto da Boa Esperança',
  'Ponta dos Seixas', 'Portal do Sol', 'Rangel', 'Roger', 'São José',
  'São Pedro', 'Tambaú', 'Tambiá', 'Torre', 'Treze de Maio',
  'Valentina de Figueiredo', 'Varjão', 'Aeroclube'
].sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });

bairroDatalist.innerHTML = bairrosJP.map(function (nome) {
  return '<option value="' + nome + '"></option>';
}).join('');

// ── Municípios da Paraíba ────────────────────────────────────────────────────
let cidadesPB = [];
let cidadesCarregadas = false;

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
  if (!cidadesCarregadas) return true;
  const valor = normalize(cidadeInput.value);
  return cidadesPB.some(function (nome) { return normalize(nome) === valor; });
}

// ── Campo de bairro (só para João Pessoa) ────────────────────────────────────
cidadeInput.addEventListener('input', function () {
  cidadeError.classList.remove('visible');
  if (normalize(cidadeInput.value) === normalize('João Pessoa')) {
    bairroWrapper.classList.remove('hidden');
    bairroInput.setAttribute('required', 'required');
  } else {
    bairroWrapper.classList.add('hidden');
    bairroInput.removeAttribute('required');
    bairroInput.value = '';
  }
});

// ── Campo "Outro" por candidato ───────────────────────────────────────────────
['cicero', 'mersinho', 'hervazio', 'veneziano'].forEach(function (nome) {
  document.querySelectorAll('input[name="' + nome + '"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      const outroDiv = document.getElementById('outro-' + nome);
      const outroInput = outroDiv.querySelector('input');
      if (radio.value === 'Não') {
        outroDiv.classList.remove('hidden');
        outroInput.setAttribute('required', 'required');
      } else {
        outroDiv.classList.add('hidden');
        outroInput.removeAttribute('required');
        outroInput.value = '';
      }
    });
  });
});

// ── Envio do formulário ───────────────────────────────────────────────────────
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
    bairro: formData.get('bairro') || '',
    cicero: formData.get('cicero'),
    ciceroOutro: formData.get('ciceroOutro') || '',
    mersinho: formData.get('mersinho'),
    mersinhoOutro: formData.get('mersinhoOutro') || '',
    hervazio: formData.get('hervazio'),
    hervazioOutro: formData.get('hervazioOutro') || '',
    veneziano: formData.get('veneziano'),
    venezianoOutro: formData.get('venezianoOutro') || '',
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
