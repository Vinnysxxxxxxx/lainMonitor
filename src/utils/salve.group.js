const fs = require('fs');
const path = require('path');
const groupFile = path.join(__dirname, 'group.json');

function saveGroupInfo(info) {
  let data = [];
  if (fs.existsSync(groupFile)) {
    data = JSON.parse(fs.readFileSync(groupFile));
  }

  const alreadyExists = data.some(g => g.jid === info.jid);
  if (!alreadyExists) {
    data.push(info);
    fs.writeFileSync(groupFile, JSON.stringify(data, null, 2));
    console.log(`💾 Grupo salvo: ${info.name}`);
  }
}



module.exports = saveGroupInfo;
