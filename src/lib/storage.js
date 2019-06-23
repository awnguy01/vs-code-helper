const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const appDataPath = path.join(app.getPath('userData'), 'appData.json');

let data = null;

const load = () => {
  if (!data) {
    data = fs.existsSync(appDataPath)
      ? JSON.parse(fs.readFileSync(appDataPath, 'utf-8'))
      : {};
  }
};

const save = () => fs.writeFileSync(appDataPath, JSON.stringify(data));

exports.get = key => {
  load();
  return key in data ? data[key] : null;
};

exports.set = (key, value) => {
  load();
  data[key] = value;
  save();
};

exports.unset = key => {
  load();
  if (key in data) {
    delete data[key];
    save();
  }
};
