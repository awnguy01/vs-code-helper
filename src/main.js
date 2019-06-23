const { app, BrowserWindow, ipcMain } = require('electron');
const storage = require('./lib/storage');
const storageKeys = require('./app/constants/storage-keys');
const fs = require('fs');
const { exec } = require('child_process');
const ipcChannels = require('./app/constants/ipc-channels');

let mainWindow;

const main = () => {
  cleanInvalidProjects();

  mainWindow = new BrowserWindow({
    height: 400,
    width: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('src/app/app.html');

  mainWindow.webContents.openDevTools();

  mainWindow.on('close', () => {
    mainWindow = null;
    cleanInvalidProjects();
  });
};

app.on('ready', main);

ipcMain.addListener(ipcChannels.addProjectsMsg, (event, newProjects) => {
  const currProjects = storage.get(storageKeys.projectList) || [];
  const updatedProjects = removeListDuplicates(
    currProjects.concat(newProjects)
  );
  storage.set(storageKeys.projectList, updatedProjects);
  cleanInvalidProjects();
  event.reply(
    ipcChannels.getProjectsReply,
    storage.get(storageKeys.projectList) || []
  );
});

ipcMain.addListener(ipcChannels.getProjectsMsg, event => {
  cleanInvalidProjects();
  event.reply(
    ipcChannels.getProjectsReply,
    storage.get(storageKeys.projectList) || []
  );
});

ipcMain.addListener(ipcChannels.openVsCodeMsg, (event, project) => {
  if (fs.existsSync(project.path)) {
    exec(`code ${project.path}`);
  } else {
    cleanInvalidProjects();
    event.reply(
      ipcChannels.getProjectsReply,
      storage.get(storageKeys.projectList) || []
    );
  }
});

ipcMain.addListener(ipcChannels.deleteProjectsMsg, (event, projects) => {
  const currProjects = storage.get(storageKeys.projectList) || [];
  const filteredProjects = currProjects.filter(testProject => {
    for (let targetProject of projects) {
      if (JSON.stringify(targetProject) === JSON.stringify(testProject)) {
        return false;
      }
    }
    return true;
  });
  storage.set(storageKeys.projectList, filteredProjects);
  event.reply(
    ipcChannels.getProjectsReply,
    storage.get(storageKeys.projectList)
  );
});

const removeListDuplicates = list =>
  list.filter(
    (item, index) =>
      index ===
      list.findIndex(
        testItem => JSON.stringify(item) === JSON.stringify(testItem)
      )
  );

const cleanInvalidProjects = () => {
  const currProjects = storage.get(storageKeys.projectList) || [];
  const sanitizedProjects = [];
  for (let project of currProjects) {
    if (typeof project.path === 'string' && fs.existsSync(project.path)) {
      sanitizedProjects.push(project);
    }
  }
  return storage.set(storageKeys.projectList, sanitizedProjects);
};
