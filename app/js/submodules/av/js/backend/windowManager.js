const {app, BrowserWindow, dialog, nativeImage} = require("electron")
const fs = require("fs")
const path = require('path')

module.exports = class WindowManager{
  #WINDOWS

  static ICON = nativeImage.createFromPath("./icons/icon.png")

  constructor(){
    this.#WINDOWS = {}
  }
  focus(type){
    if(this.#WINDOWS[type]){
      this.#WINDOWS[type].focus()
    }
  }
  alert(type,message,title){
    let w = this.getFocusedWindow()
    dialog.showMessageBox(w, {
      title: title || type || "Info",
      message: message,
      type: type.toLowerCase() || "none",
      buttons: ["Close"],
      icon: WindowManager.ICON
    })
  }
  openFile(type,callback){
    let w = this.getFocusedWindow()
    dialog.showOpenDialog(w, {
      filters: [{ name: "Custom File Type", extensions: [type] }],
      properties: ["openFile"]
    }).then(result => {
      if(!result.canceled && result.filePaths.length > 0){
        let filepath = result.filePaths[0]
        let filetype = filepath.split(".")
        filetype = filetype[filetype.length-1]
        if(filetype != type){
          this.alert("Error","This filetype is not supported")
          return
        }
        else{
          fs.readFile(filepath, 'utf-8', (err, data) => {
            if(err){
              this.alert("Error","An error ocurred reading the file :" + err.message) 
              return
            }
            else{
              let parsed = JSON.parse(data)
              if(callback){
                callback(parsed)
              }
            }
          })
        }
      }
    })
  }
  getOpenFilepath(type,callback){
    let w = this.getFocusedWindow()
    dialog.showOpenDialog(w, {
      filters: [{ name: "Custom File Type", extensions: [type] }],
      properties: ["openFile"]
    }).then(result => {
      if(!result.canceled && result.filePaths.length > 0){
        let filepath = result.filePaths[0]
        let filetype = filepath.split(".")
        filetype = filetype[filetype.length-1]
        if(filetype != type){
          this.alert("Error","This filetype is not supported")
          return
        }
        else{
          callback(filepath)
        }
      }
    })
  }
  getSaveFilepathFor(name,type,callback){
    let w = this.getFocusedWindow()
    dialog.showSaveDialog(w, {
      filters: [{ name: "Custom File Type", extensions: [type] }],
      defaultPath: name.toLowerCase()
    }).then(result => {
      if(!result.canceled && result.filePath.length > 0){
        let filepath = result.filePath
        let filetype = filepath.split(".")
        filetype = filetype[filetype.length-1]
        if(filetype != type){
          this.alert("Error","Cannot save as this filetype")
          return
        }
        else{
          callback(filepath)
        }
      }
    })
  }
  switch(){
    let windows = Object.keys(this.#WINDOWS)
    for(let i in windows){
      let w = this.#WINDOWS[windows[i]]
      if(w.isFocused()){
        w.blur()
        this.#WINDOWS[windows[(i + 1) % windows.length]].focus()
        return
      }
    }
    this.#WINDOWS[windows[0]].focus()
  }
  getFocusedWindow(){
    let windows = Object.keys(this.#WINDOWS)
    for(let i in windows){
      let w = this.#WINDOWS[windows[i]]
      if(w.isFocused()){
        return w
      }
    }
    this.#WINDOWS[windows[0]]
  }
  open(type,config){
    type = type || "index"
    if(this.#WINDOWS[type]){
      this.focus(type)
    }
    else{
      this.#create(type,config)
    }
  }
  #create(type,config) {
      this.destroy(type)
      let win = new BrowserWindow({
      title: app.name.toUpperCase() + (type != "index" ? " - " + type.toUpperCase() : ""),
      width: config.width || 800,
      height: config.height || 600,
      minWidth: config.minWidth || 200,
      minHeight: config.minHeight || 200,
      resizable: config.resizable || true,
      fullscreenable: config.resizable || true,
      backgroundColor: config.backgroundColor || "#000000",
      icon: path.join(__dirname, { darwin: "icon.icns", linux: "icon.png", win32: "icon.ico" }[process.platform] || "icon.ico"),
      webPreferences: {
        devTools: config.devTools || false,
        enableRemoteModule: true,
        nodeIntegration: config.nodeIntegration || true,
        contextIsolation: false,
        backgroundThrottling: false,
        additionalArguments: ["--dev=" + config.devTools]
      }
    })
    if(config.midi){
      win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        if (permission === 'midi') {
          return callback(true)
        }
      })
    }
    if(config.onclose){
      win.on('close', config.onclose)
    }
    win.on("unresponsive", () => {
      console.log("ERROR 61 - Window does not respond")
      app.quit()
    })
    win.webContents.on("crashed", () => {
      console.log("ERROR 62 - Webcontent renderer crashed")
      app.quit()
    })
    win.webContents.on("destroyed", () => {
      console.log("ERROR 63 - Webcontent destroyed")
      delete this.#WINDOWS[type]
    })
    win.loadFile("./windows/" + type + ".html")
    this.#WINDOWS[type] = win
  }
  refresh(sender){
    for(let w in this.#WINDOWS){
      if(sender != w){
        this.#WINDOWS[w].webContents.send("refresh",sender)
      }
    }
  }
  send(message){
    for(let w in this.#WINDOWS){
      this.#WINDOWS[w].webContents.send("action",message)
    }
  }
  destroy(type){
    if(this.isOpen(type)){
      this.#WINDOWS[type].close()
      delete this.#WINDOWS[type]
    }
  }
  isOpen(type){
    return this.#WINDOWS[type] != null
  }
  hasWindows(){
    return this.#WINDOWS.keys().length > 0
  }
}