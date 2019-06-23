const { ipcRenderer } = require('electron');
const classes = require('./constants/dom-class-names');
const ipcChannels = require('./constants/ipc-channels');
const ListItemComponent = require('./components/list-item');

window.onload = () => {
  const dropZone = document.getElementsByClassName(classes.dndContainer)[0];

  dropZone.ondragover = dropZone.ondragenter = () => {
    dropZone.classList.add(classes.dndContainerDragOver);
    return false;
  };

  dropZone.ondragleave = () => {
    dropZone.classList.remove(classes.dndContainerDragOver);
    return false;
  };

  dropZone.ondrop = event => {
    const dirList = [];
    const files = event.dataTransfer.files;
    for (let file of files) {
      if (file.type.length) {
        console.error('Dropped file is not a project folder');
        return;
      }
      dirList.push({
        name: file.name,
        path: file.path
      });
    }
    ipcRenderer.send(ipcChannels.addProjectsMsg, dirList);
    dropZone.classList.remove(classes.dndContainerDragOver);
  };

  ipcRenderer.on(ipcChannels.getProjectsReply, (event, projects) => {
    const listArea = document.getElementsByClassName(classes.listContainer)[0];
    listArea.innerHTML = '';
    for (let project of projects) {
      listArea.appendChild(
        ListItemComponent.createListItem(project.name, project)
      );
    }
  });
  ipcRenderer.send(ipcChannels.getProjectsMsg);

  document.onclick = event => {
    const target = event.target;

    if (containsClass(target, classes.listButtonVscode)) {
      const listItem = target.closest(`.${classes.listItem}`);
      const projectData = JSON.parse(listItem.dataset.data);
      ipcRenderer.send(ipcChannels.openVsCodeMsg, projectData);
    }

    if (containsClass(target, classes.listButtonDelete)) {
      const listItem = target.closest(`.${classes.listItem}`);
      const projectData = JSON.parse(listItem.dataset.data);
      ipcRenderer.send(ipcChannels.deleteProjectsMsg, [projectData]);
    }
  };
};

const containsClass = (element, className) => {
  return element.classList.contains(className);
};
