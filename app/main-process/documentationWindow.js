const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const path = require("path");

const electronWindowOptions = {
  width: 1000,
  height: 650,
  minWidth: 700,
  minHeight: 300,
  title: "Documentation",
  autoHideMenuBar: true
};

var documentationWindow = null;

function getDocWindowPath(language) {
  const isZh = language && (language === 'zh-CN' || language.startsWith('zh'));
  const filename = isZh ? 'window.zh-CN.html' : 'window.html';
  return "file://" + __dirname + "/../renderer/documentation/" + filename;
}

function DocumentationWindow(theme, language) {
	electronWindowOptions.theme = theme;
  var w = new BrowserWindow(electronWindowOptions);
  w.loadURL(getDocWindowPath(language));

  // w.webContents.openDevTools();
	
  w.webContents.on("did-finish-load", () => {
    w.webContents.send("change-theme", theme);
    w.setMenu(null);
    w.show();
  });

  this.browserWindow = w;

  w.on("close", () => {
    documentationWindow = null;
  });
}

DocumentationWindow.openDocumentation = function (theme, language) {

  if( documentationWindow == null ) {
    documentationWindow = new DocumentationWindow(theme, language);
  }
  return documentationWindow;
}


DocumentationWindow.changeTheme = function (theme) {
  if( documentationWindow != null ) {
    documentationWindow.browserWindow.webContents.send("change-theme", theme);
  }
}

DocumentationWindow.changeLanguage = function (language) {
  if( documentationWindow != null ) {
    documentationWindow.browserWindow.loadURL(getDocWindowPath(language));
  }
}

exports.DocumentationWindow = DocumentationWindow;
