import {TRAMWrapper} from "./js/tramWrapper.js"
import {Sampler} from "./js/sampler.js"

window.addEventListener("DOMContentLoaded",function(){
  const allow = document.getElementById("allow")
  allow.addEventListener("mousedown",init)
  function init(){
    document.body.classList.remove("no-allow")
    const input = document.getElementById("input")
    const file = {
      filename: "demo",
      filetype: "tram",
      input: "",
      settings: {
          general: {
            occupiedCharacters: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#=:",
            fontsize: 18,
            alignTextCenter: false
          },
          tram: {
            mapping: {
              A: [156, 60, 80],
              B: [150, 48, 127],
              C: [147, 48, 127],
              D: [146, 48, 100],
              E: [156, 48, 80],
              F: [155, 48, 100],
              G: [144, 60, 100],
              H: [152, 48, 80],
              I: [156, 49, 127],
              J: [149, 36, 127],
              K: [144, 48, 127],
              L: [149, 48, 127],
              M: [157, 48, 100],
              N: [158, 48, 100],
              O: [156, 54, 80],
              P: [144, 48, 100],
              Q: [145, 48, 80],
              R: [145, 60, 100],
              S: [145, 48, 127],
              T: [144, 48, 127],
              U: [156, 36, 100],
              V: [159, 48, 100],
              W: [151, 48, 127],
              X: [152, 48, 100],
              Y: [153, 48, 100],
              Z: [154, 48, 100]
            },
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
      e.preventDefault()
      file.input = input.innerText
      tram.update(file)
    })
    let sampler = new Sampler("../samples/",
      [
        "x0x/bd.wav",
        "x0x/sd.wav",
        "x0x/rs.wav",
        "x0x/cp.wav",
        "x0x/pc.wav",
        "x0x/lt.wav",
        "x0x/mt.wav",
        "x0x/ht.wav",
        "x0x/ch.wav",
        "x0x/oh.wav",
        "x0x/rd.wav",
        "x0x/cy.wav",
        "x0x/101.wav",
        "frogs/eastern_spadefoot.wav",
        "frogs/pickerel_frog.wav",
        "frogs/bullfrog.wav"
      ])
    let tram = new TRAMWrapper(sampler)
    file.input = input.innerText
    tram.update(file)
  }
})