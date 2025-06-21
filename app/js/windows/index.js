import {ACIDWrapper} from "../submodules/acid/js/acidWrapper.js"
import {TRAMWrapper} from "../submodules/tram/js/tramWrapper.js"
import {IOWrapper} from "../submodules/av/js/frontend/ioWrapper.js"
import {GUIWrapper} from "../submodules/av/js/frontend/guiWrapper.js"
import {FSWrapper} from "../submodules/av/js/frontend/fsWrapper.js"

const ipc = require("electron").ipcRenderer

window.addEventListener("DOMContentLoaded",function(){
  let FILE

  const input = document.getElementById("input")
  const filename = document.getElementById("filename")

  let fs = new FSWrapper(function(){
    FILE = fs.get()
    initGUI()
    save()
    document.body.classList.remove("preload")
  })
  
  function save(){
    update()
    fs.save(FILE,function(){
      ipc.send("refresh","index")
    })
  }
  function update(){
    if(input.innerText != FILE.input){
      input.blur()
      input.innerText = FILE.input
    }
    if(filename.innerText != FILE.filename){
      filename.blur()
      filename.innerText = FILE.filename
    }
    let a = acid.update(FILE)
    FILE.acid.shader = a.shader
    FILE.acid.parameters = a.parameters
    tram.update(FILE)
    gui.update(FILE)
  }
  function refresh() {
    fs.update(() => {
      FILE = fs.get()
      save()
    })
  }

  function initGUI(){
    input.innerText = FILE.input
    filename.innerText = FILE.filename
    FILE.io = io.refresh()
    input.addEventListener("input",function(e){
      let text = e.target.innerText
      FILE.input = text
      save()
    })
    input.addEventListener("keydown",function(e){
      console.log(e)
      if(
        e.keyCode == 9 ||
        (e.keyCode == 37 || e.keyCode == 39) && e.shiftKey && e.metaKey
      ){
        e.preventDefault()
      }
    })
    filename.addEventListener("keydown",function(e){
      if(e.keyCode == 9 || e.keyCode == 13 || e.keyCode == 32){
        e.preventDefault()
      }
    })
    filename.addEventListener("blur",function(e){
      let fn = e.target.innerText
      if(fn.length == 0){
        fn = "UNTITLED"
        e.target.innerText = fn
      }
      FILE.filename = fn
      save()
    })
  }

  const actions = {
    save: function(){
      fs.export()
    }.bind(this),
    refreshio: function(){
      FILE.io = io.refresh()
      save()
    }.bind(this),
    changeinput: function(){
      io.nextInput()
      FILE.io = io.refresh()
      save()
    }.bind(this),
    previousinput: function(){
      io.prevInput()
      FILE.io = io.refresh()
      save()
    }.bind(this),
    nextinput: function(){
      io.nextInput()
      FILE.io = io.refresh()
      save()
    }.bind(this),
    changeoutput: function(){
      io.nextOutput()
      FILE.io = io.refresh()
      save()
    }.bind(this),
    previousoutput: function(){
      io.prevOutput()
      FILE.io = io.refresh()
      save()
    }.bind(this),
    nextoutput: function(){
      io.nextOutput()
      FILE.io = io.refresh()
      save()
    }.bind(this),
    tempoup: function(){
      FILE.config.clock.tempo = Math.min(600,FILE.config.clock.tempo+1)
      save()
    }.bind(this),
    tempodown: function(){
      FILE.config.clock.tempo =  Math.max(1,FILE.config.clock.tempo-1)
      save()
    }.bind(this),
    toggleclocktype: function(){
      FILE.config.clock.type = !FILE.config.clock.type
      save()
    }.bind(this),
    toggleclocksource: function(){
      FILE.config.clock.source = !FILE.config.clock.source
      save()
    }.bind(this),
    toggleclocksend: function(){
      FILE.config.io.clock.send = !FILE.config.io.clock.send
      save()
    }.bind(this),
    toggleclockrecieve: function(){
      FILE.config.io.clock.recieve = !FILE.config.io.clock.recieve
      save()
    }.bind(this),
    toggletransportsend: function(){
      FILE.config.io.transport.send = !FILE.config.io.transport.send
      save()
    }.bind(this),
    toggletransportrecieve: function(){
      FILE.config.io.transport.recieve = !FILE.config.io.transport.recieve
      save()
    }.bind(this),
    playpause: function(){
      FILE.transport.running = !FILE.transport.running
      FILE.transport.stopped = false
      save()
    }.bind(this),
    stop: function(){
      FILE.transport.running = false
      FILE.transport.stopped = true 
      save()
    }.bind(this),
    forwards: function(){
      FILE.transport.delay += 100
      save()
    },
    backwards: function(){
      FILE.transport.delay -= 100
      save()
    }
  }

  const displays = {
    fileType: "filetype",
    inputLabel: "io.in.selected.label",
    inputTotal: "io.in.available",
    inputIndex: "io.in.selected.index",
    outputLabel: "io.out.selected.label",
    outputTotal: "io.out.available",
    outputIndex: "io.out.selected.index",
    tempo: "config.clock.tempo",
    clockType: "config.clock.type",
    clockSource: "config.clock.source",
    clockSend: "config.io.clock.send",
    clockRecieve: "config.io.clock.recieve",
    transportSend: "config.io.transport.send",
    transportRecieve: "config.io.transport.recieve",
    transportRunning: "transport.running",
    transportStopped: "transport.stopped"
  }
  
  let gui = new GUIWrapper(actions,displays)
  let io = new IOWrapper()
  let acid = new ACIDWrapper()
  let tram = new TRAMWrapper(io)

  ipc.on("action", (event,action) => {
    action = action.toLowerCase()
    if(actions[action]){
      actions[action]()
    }
  }) 
  ipc.on("refresh", (event,sender) => {
    refresh()
  }) 
})

