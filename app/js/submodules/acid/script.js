import {ACIDWrapper} from './js/acidWrapper.js'

window.addEventListener('DOMContentLoaded',function(){
  const input = document.getElementById('input')
  const acid = new ACIDWrapper()
  const file = {
    filename: "demo",
    filetype: "acid",
    input: "",
    settings: {
        general: {
          occupiedCharacters: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#=:",
          fontsize: 18,
          alignTextCenter: false
        },
        tram: {
          mapping: {},
          properties: {
            commentIndicator: "#",
            mappingIndicator: "=",
            dataDelimiter: ":"
          }

        },
        acid: {
          mapping: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
          properties: {
            globalBitmap: false,
            seed: 42,
            commentIndicator: "!",
            ignoreMappings: false
          }
        }
      },
    io: {},
    acid: {
      shader: "",
      config: {}
    },
    transport: {
      running: true,
      stopped: false,
      delay: 0
    },
    config: {
        clock: {
          tempo: 128,
          source: false,
          type: true
        },
        io: {
          transport: {
            send: true,
            recieve: false
          },
          clock: {
            send: true,
            recieve: false
          }
        }
    }
  }
  input.addEventListener("input",function(e){
    file.input = input.innerText
    update()
  })
  function update(){
    acid.update(file)
  }
  file.input = input.innerText
  update()
})