const fs = require("fs");
const path = require('path');
const usuariosPath = path.join(__dirname, '../..', 'usuarios.json');
function resetarPalavras(numero) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(usuariosPath, 'utf8'));
  } catch (err) {
    console.error('❌ Erro ao ler usuarios.json:', err.message);
    data = {};
  }
  data[numero] = [];

  fs.writeFileSync(usuariosPath, JSON.stringify(data, null, 2));
}

module.exports = resetarPalavras;