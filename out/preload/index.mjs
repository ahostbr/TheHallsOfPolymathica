import { contextBridge, ipcRenderer, webFrame } from "electron";
const api = {
  appInfo: {
    version: "1.0.0",
    commitHash: "dd9f83a",
    buildDate: "2026-03-03",
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    platform: process.platform
  },
  pty: {
    create: (shell, cwd) => ipcRenderer.invoke("pty:create", shell, cwd),
    write: (sessionId, data) => ipcRenderer.send("pty:write", sessionId, data),
    resize: (sessionId, cols, rows) => ipcRenderer.send("pty:resize", sessionId, cols, rows),
    kill: (sessionId) => ipcRenderer.send("pty:kill", sessionId),
    onData: (sessionId, callback) => {
      const channel = `pty:data:${sessionId}`;
      const handler = (_e, data) => callback(data);
      ipcRenderer.on(channel, handler);
      return () => ipcRenderer.removeListener(channel, handler);
    },
    onExit: (sessionId, callback) => {
      const channel = `pty:exit:${sessionId}`;
      const handler = (_e, exitCode) => callback(exitCode);
      ipcRenderer.on(channel, handler);
      return () => ipcRenderer.removeListener(channel, handler);
    },
    onFocus: (callback) => {
      const handler = (_e, sessionId) => callback(sessionId);
      ipcRenderer.on("pty:focus", handler);
      return () => ipcRenderer.removeListener("pty:focus", handler);
    }
  },
  window: {
    minimize: () => ipcRenderer.send("window:minimize"),
    maximize: () => ipcRenderer.send("window:maximize"),
    close: () => ipcRenderer.send("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
    onMaximizeChange: (callback) => {
      const handler = (_e, maximized) => callback(maximized);
      ipcRenderer.on("window:maximize-change", handler);
      return () => ipcRenderer.removeListener("window:maximize-change", handler);
    },
    zoomIn: () => {
      const l = webFrame.getZoomLevel() + 0.5;
      webFrame.setZoomLevel(l);
      return l;
    },
    zoomOut: () => {
      const l = webFrame.getZoomLevel() - 0.5;
      webFrame.setZoomLevel(l);
      return l;
    },
    zoomReset: () => {
      webFrame.setZoomLevel(0);
      return 0;
    },
    getZoomLevel: () => webFrame.getZoomLevel(),
    setZoomLevel: (level) => {
      webFrame.setZoomLevel(level);
    }
  },
  db: {
    getAllPolymaths: () => ipcRenderer.invoke("db:get-all-polymaths"),
    getPolymath: (id) => ipcRenderer.invoke("db:get-polymath", id),
    getConversations: (polymathId, limit, offset) => ipcRenderer.invoke("db:get-conversations", polymathId, limit, offset),
    getConversation: (id) => ipcRenderer.invoke("db:get-conversation", id),
    createConversation: (data) => ipcRenderer.invoke("db:create-conversation", data),
    addTag: (conversationId, tag) => ipcRenderer.invoke("db:add-tag", conversationId, tag),
    getTagsForConversation: (conversationId) => ipcRenderer.invoke("db:get-tags", conversationId),
    searchConversations: (query) => ipcRenderer.invoke("db:search-conversations", query),
    getPolymathStats: (polymathId) => ipcRenderer.invoke("db:get-polymath-stats", polymathId)
  },
  settings: {
    load: () => ipcRenderer.invoke("settings:load"),
    save: (data) => ipcRenderer.invoke("settings:save", data)
  },
  session: {
    spawn: (polymathId) => ipcRenderer.invoke("session:spawn", polymathId)
  }
};
contextBridge.exposeInMainWorld("api", api);
