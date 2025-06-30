import {TRAMWrapper} from "./js/tramWrapper.js"
import {Sampler} from "./js/sampler.js"

window.addEventListener("DOMContentLoaded",function(){
  const allow = document.getElementById("allow")
  allow.addEventListener("mousedown",init)
  function init(){
    document.body.classList.remove("no-allow")
    const input = document.getElementById("input")
    const FILE = {
      input:"",
      transport: {
        running: true
      },
      config: {
        clock: {
          tempo: 128
        }
      }
    }
    input.addEventListener("input",function(e){
      e.preventDefault()
      FILE.input = input.innerText
      TRAM.update(FILE)
    })
    let sampler = new Sampler("../samples/",
      [
        "bd.wav",
        "sd.wav",
        "rs.wav",
        "cp.wav",
        "pc.wav",
        "lt.wav",
        "mt.wav",
        "ht.wav",
        "ch.wav",
        "oh.wav",
        "rd.wav",
        "cy.wav",
        "101.wav",
        "303.wav",
        "fm.wav",
        "chord.wav"
      ])
    let TRAM = new TRAMWrapper(sampler)
  }
  
})