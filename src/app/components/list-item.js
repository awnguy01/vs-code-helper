const classes = require('../constants/dom-class-names');

exports.createListItem = (label, data) => {
  const item = document.createElement('div');
  item.dataset.data = JSON.stringify(data);
  item.setAttribute('class', classes.listItem);
  item.appendChild(
    document.createElement('span').appendChild(document.createTextNode(label))
  );
  item.appendChild(createButtonGroup());
  return item;
};

const createButtonGroup = () => {
  const buttonGroup = document.createElement('div');
  buttonGroup.setAttribute('class', classes.listButtons);
  buttonGroup.appendChild(createVsCodeButton());
  buttonGroup.appendChild(createDeleteButton());
  return buttonGroup;
};

const createDeleteButton = () => {
  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('class', classes.listButtonDelete);
  deleteButton.innerText = 'X';
  return deleteButton;
};

const createVsCodeButton = () => {
  const vsButton = document.createElement('button');
  vsButton.setAttribute('class', classes.listButtonVscode);
  vsButton.innerText = 'VS Code';
  return vsButton;
};
