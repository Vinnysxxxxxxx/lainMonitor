const fs = require('fs');
const path = require('path');
const usuariosPath = path.join(__dirname, '../..', 'usuarios.json');


if (!fs.existsSync(usuariosPath)) fs.writeFileSync(usuariosPath, '{}');

function salvarPalavras(numero, palavras) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(usuariosPath, 'utf8'));
  } catch (err) {
    console.error('❌ Erro ao ler usuarios.json:', err.message);
    data = {};
  }

  if (!data[numero]) data[numero] = [];

  for (const palavra of palavras) {
    const p = palavra.toLowerCase();
    if (!data[numero].includes(p)) {
      data[numero].push(p);
    }
  }

  fs.writeFileSync(usuariosPath, JSON.stringify(data, null, 2));
}

module.exports = salvarPalavras;
