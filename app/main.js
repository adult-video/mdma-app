const WindowManager = require("./js/cores/av-core/js/backend/windowManager.js")
const FSManager = require("./js/cores/av-core/js/backend/fsManager.js")
const MenuManager = require("./js/cores/av-core/js/backend/menuManager.js")
const ActionManager = require("./js/cores/av-core/js/backend/actionManager.js")

const defaultfile = require("./js/templates/file.js")
const menu = require("./js/templates/menu.js")

const {app, ipcMain, dialog} = require("electron")



const DEV = true
const wm = new WindowManager()
const ah = new ActionManager({
    OpenViewer: () => {
      wm.open("viewer",{devTools:DEV})
    },
    OpenEditor: () => {
      wm.open("editor",{devTools:DEV})
    },
    Open: () => {
      wm.getOpenFilepath(fs.type,(data) => {
        fs.openFromDiskWithPath(data,(error) => {
          if(error){
            wm.alert("Error",error)
          }
          else{
            wm.refresh()
          }
        })
      })
    },
    Save: () => {
      wm.getSaveFilepathFor(fs.name,fs.type,(data) => {
        fs.saveToDiskWithPath(data,(error) => {
          if(error){
            wm.alert("Error",error)
          }
        })
      })
    },
    FocusWorkspace: () => {
      wm.focus("index")
    },
    SwitchWindow: () => {
      wm.switch()
    }
  },
  (f) => {
    wm.send(f)
  }
)
const mm = new MenuManager(menu,ah)
const fs = new FSManager(app.name.toLowerCase(),defaultfile)


app.whenReady().then(() => {
  

  ipcMain.on('refresh', (event,sender) => {
    fs.refresh()
    wm.refresh(sender)
  })
  
  wm.open("index",{devTools:DEV})
 
  app.on("gpu-process-crashed", () => {
    console.log("ERROR 64 - App GPU process has crashed")
    app.quit()
  })
  process.on("uncaughtException", function (err) {
    console.log("ERROR 60 - process thrown exception")
    console.log(err)
    app.quit()
  })
})

app.on('window-all-closed', function () {
  if(process.platform !== 'darwin'){
    app.quit()
  }
})