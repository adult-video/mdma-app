import {FSWrapper} from "../cores/av-core/js/frontend/fsWrapper.js"

const ipc = require("electron").ipcRenderer

window.addEventListener("DOMContentLoaded",function(){
  let FILE

  const input = document.getElementById("input")
  let fs = new FSWrapper(function(){
    refresh()
  })
  input.addEventListener("input",() => {
    FILE.input = input.innerText
    save()
  })

  ipc.on("refresh", (event,sender) => {
    refresh()
  })  
  
  function save(){
    fs.save(FILE,function(){
      ipc.send("refresh","editor")
    })
  }

  function update(){
    if(FILE.input != input.innerText){
      input.innerText = FILE.input
    }
  }
  function refresh(){
    fs.update(() => {
      FILE = fs.get()
      update()
    })  
  }
})

