const fs = require("fs");
const path = require('path');
const usuariosPath = path.join(__dirname, '..', 'usuarios.json');
function removerPalavras(numero, palavras) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(usuariosPath, 'utf8'));
  } catch (err) {
    console.error('❌ Erro ao ler usuarios.json:', err.message);
    return [];
  }

  if (!data[numero] || data[numero].length === 0) {
    return [];
  }

  const removidas = [];
  for (const palavra of palavras) {
    const p = palavra.toLowerCase();
    const idx = data[numero].indexOf(p);
    if (idx !== -1) {
      data[numero].splice(idx, 1);
      removidas.push(p);
    }
  }

  fs.writeFileSync(usuariosPath, JSON.stringify(data, null, 2));
  return removidas;
}


module.exports = removerPalavras;
