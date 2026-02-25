import { app, BrowserWindow, ipcMain } from 'electron';
import { join, resolve } from 'path';
import { dispatch, getEvidence, resetDemo, startBridgeServer, setBridgeRepoPath } from '@cursorpilot/engine';
import type { ActionEvent } from '@cursorpilot/shared';
import { IPC } from '@cursorpilot/shared';

// The demo-repo path relative to the project root
const DEMO_REPO_PATH = resolve(join(__dirname, '..', '..', '..', '..', 'demo-repo'));

// Tell the bridge server where the demo repo is
setBridgeRepoPath(DEMO_REPO_PATH);

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: 'CursorPilot OS',
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#0a0a0f',
        webPreferences: {
            preload: join(__dirname, '..', 'preload', 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
        },
    });

    // In dev, load from Vite dev server; in prod, load from built files
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(join(__dirname, '..', 'renderer', 'index.html'));
    }
}

// ── IPC Handlers ───────────────────────────────────────
ipcMain.handle(IPC.DISPATCH, async (_event, actionEvent: ActionEvent) => {
    return dispatch(actionEvent, DEMO_REPO_PATH);
});

ipcMain.handle(IPC.GET_EVIDENCE, async () => {
    return getEvidence();
});

ipcMain.handle(IPC.RESET, async () => {
    return resetDemo(DEMO_REPO_PATH);
});

// ── App lifecycle ──────────────────────────────────────
app.whenReady().then(async () => {
    // Start the bridge server for plugin communication
    try {
        await startBridgeServer();
    } catch (err) {
        console.error('Failed to start bridge server:', err);
    }

    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
