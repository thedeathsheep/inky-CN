const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const i18n = require("./i18n/i18n.js");

const quickRefWindowOptions = {
  width: 520,
  height: 480,
  minWidth: 400,
  minHeight: 360,
  title: "Quick reference",
  autoHideMenuBar: true,
  webPreferences: {
    nodeIntegration: true
  }
};

var quickRefWindow = null;

function getQuickRefPath(language) {
  const isZh = language && (language === 'zh-CN' || language.startsWith('zh'));
  const filename = isZh ? 'quickref.zh-CN.html' : 'quickref.html';
  return "file://" + __dirname + "/../renderer/documentation/" + filename;
}

function QuickRefWindow(theme, language) {
  quickRefWindowOptions.theme = theme;
  quickRefWindowOptions.title = i18n._("Quick reference");
  var w = new BrowserWindow(quickRefWindowOptions);
  w.loadURL(getQuickRefPath(language));

  w.webContents.on("did-finish-load", () => {
    w.webContents.send("change-theme", theme);
    w.setMenu(null);
    w.show();
  });

  this.browserWindow = w;

  w.on("close", () => {
    quickRefWindow = null;
  });
}

QuickRefWindow.openQuickRef = function (theme, language) {
  if (quickRefWindow == null) {
    quickRefWindow = new QuickRefWindow(theme, language);
  }
  return quickRefWindow;
};

QuickRefWindow.changeTheme = function (theme) {
  if (quickRefWindow != null) {
    quickRefWindow.browserWindow.webContents.send("change-theme", theme);
  }
};

QuickRefWindow.changeLanguage = function (language) {
  if (quickRefWindow != null) {
    quickRefWindow.browserWindow.loadURL(getQuickRefPath(language));
  }
};

exports.QuickRefWindow = QuickRefWindow;
