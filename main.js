
const path = require("path");
const {
  app,
  BrowserWindow,
  session
} = require("electron");

const { bindSmartSpectraIpc } =
  require("@smartspectra/node-sdk/main");

function createWindow() {
  const win = new BrowserWindow({
    width: 1250,
    height: 850,
    minWidth: 950,
    minHeight: 650,
    backgroundColor: "#0B1020",
    webPreferences: {
      preload: require.resolve(
        "@smartspectra/node-sdk/preload"
      ),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  bindSmartSpectraIpc(win);

  win.webContents.setWindowOpenHandler(
    () => ({ action: "deny" })
  );

  win.webContents.on("will-navigate", (event) => {
    event.preventDefault();
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  // Only grant camera permission to our bundled application.
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback, details) => {
      const url =
        details?.requestingUrl || webContents.getURL();

      callback(
        permission === "media" &&
        url.startsWith("file://")
      );
    }
  );

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});