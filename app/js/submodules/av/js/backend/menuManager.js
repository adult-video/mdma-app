const {app,Menu,globalShortcut} = require("electron")

module.exports = class MenuManager{

  #HANDLER
  #FILE = {
    content: {},
    type: "config",
    name: "untitled"
  }
  click = (s) => {this.menuAction(s)}

  constructor(template,handler){
    this.#HANDLER = handler
    let t = this.#populateTemplate(template)
    let menu = Menu.buildFromTemplate(t)
    Menu.setApplicationMenu(menu)
  }

  menuAction(item){
    this.#HANDLER.action(item.label)
  }

  #populateTemplate(template){
    const isMac = process.platform === "darwin"
    
    let menu = {
      mac: {
        label: app.name,
        submenu: [
          { role: "about" },
          { type: "separator" },
          { role: "services" },
          { type: "separator" },
          { role: "hide" },
          { role: "hideothers" },
          { role: "unhide" },
          { type: "separator" },
          { role: "quit" }
        ]
      },
      file: {
        label: "File",
        submenu: [
          {  click: this.click, type: "normal", label: "Save",accelerator: "CommandOrControl+S"},
          {  click: this.click, type: "normal", label: "Open",accelerator: "CommandOrControl+O" }
        ]
      },
      view: {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "forceReload" },
          { role: "togglefullscreen" },
          { role: "toggleDevTools" }
        ]
      },
      edit: {label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]
      },
      window: {
        label: "Window",
        submenu: [
          { role: "minimize" },
          { role: "zoom" },
          ...(isMac ? [
            { type: "separator" },
            { role: "front" },
            { type: "separator" },
            { role: "window" }
          ] : [
            { role: "close" }
          ])
        ]
      }
    }
    for(let submenu in template){
      if(submenu == "extras"){
        for(let extra in template[submenu]){
          let m = template[submenu][extra]
          let e = {
            label: m.label,
            submenu: []
          }
          for(let section of m.menu){
            e.submenu.push({ type: "separator" })
            for(let entry of section){
              e.submenu.push(this.#menuItemFromTemplate(entry))
            }
          }
          menu[m.label.toLowerCase()] = e
        }
      }
      else{
        for(let section of template[submenu]){
          if(menu[submenu]){
            menu[submenu].submenu.push({ type: "separator" })
            for(let entry of section){
              menu[submenu].submenu.push(this.#menuItemFromTemplate(entry))
            }
          }
        }
      }
    }
    let w = menu.window
    delete menu.window
    menu.window = w
    menu.file.submenu.push({ type: "separator" })
    menu.file.submenu.push(isMac ? { role: "close" } : { role: "quit" })       
    return Object.values(menu)
  }
  #menuItemFromTemplate(template){
    if(template.submenu){
      let t = {label: template.label || "?", submenu: []}
      for(let s of template.submenu){
        t.submenu.push(this.#menuItemFromTemplate(s))
      }
      return t
    }
    else{
      let t = {click: this.click,label: template.label || "?"}
      if(template.acc){
        t.accelerator = template.acc.replace("CMD","CommandOrControl")
        if(
          t.accelerator.includes("Left") ||
          t.accelerator.includes("Right") ||
          t.accelerator.includes("Top") ||
          t.accelerator.includes("Bottom") ||
          t.accelerator.includes("Space")
        ){
          globalShortcut.register(t.accelerator, () => {this.click(t)})
        }
      }
      return t
    }
  }
}