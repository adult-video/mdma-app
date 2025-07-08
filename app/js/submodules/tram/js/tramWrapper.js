import {TRAM} from './tram.js'

export class TRAMWrapper{
  #IO
  #TRAM

  #SEQUENCER = {
    commentIndicator: "#",
    mappingIndicator: "=",
    dataDelimiter: ":",
    mapping: {},
    input: "",
    buffer: [],
    operators: [],
    position: 0
  }
  #TRANSPORT = {
    running: false,
    stopped: true
  }
  #CLOCK = {
    tempo: 128,
    time: 0,
    pulses: 48,
    start: 0,
    lastframe: 0,
    lastpulse: 0,
    type: true,
    external: false,
    interval: null,
    changeTimestamp: 0,
    delay: 0
  }

  constructor(io) {
    this.#IO = io
    this.#TRAM = new TRAM(this)
    this.#init()
    this.#updateTempo()
  }
  update(file){
    let tempoUpdateRequired = false
    let createLoopRequired = false
    let refreshRequired = false
    if(file.settings.tram.mapping != this.#SEQUENCER.mapping){
      this.#SEQUENCER.mapping = file.settings.tram.mapping
      refreshRequired = true
    }
    if(file.settings.tram.properties.commentIndicator != this.#SEQUENCER.commentIndicator){
      this.#SEQUENCER.commentIndicator = file.settings.tram.properties.commentIndicator
      refreshRequired = true
    }
    if(file.settings.tram.properties.mappingIndicator != this.#SEQUENCER.mappingIndicator){
      this.#SEQUENCER.mappingIndicator = file.settings.tram.properties.mappingIndicator
      refreshRequired = true
    }
    if(file.settings.tram.properties.dataDelimiter != this.#SEQUENCER.dataDelimiter){
      this.#SEQUENCER.dataDelimiter = file.settings.tram.properties.dataDelimiter
      refreshRequired = true
    }
    if(file.config.clock.tempo != this.#CLOCK.tempo){
      this.#CLOCK.tempo = file.config.clock.tempo
      tempoUpdateRequired = true
    }
    if(file.config.clock.type != this.#CLOCK.type){
      this.#CLOCK.type = file.config.clock.type
      createLoopRequired = true
    }
    if(file.input != this.#SEQUENCER.input){
      this.#SEQUENCER.input = file.input
      refreshRequired = true
    }
    if(file.config.io.clock.recieve != this.#CLOCK.external){
      this.#CLOCK.external = file.config.io.clock.recieve
      createLoopRequired = true
    }
    this.#CLOCK.delay = file.transport.delay
    if(tempoUpdateRequired){
      this.#updateTempo()
    }
    else if(createLoopRequired){
      this.#createLoop()
    }
    if(refreshRequired){
      this.#refresh()
    }
    this.#TRANSPORT.running = file.transport.running
    this.#TRANSPORT.stopped = file.transport.stopped
    if(this.#TRANSPORT.stopped){
      this.#SEQUENCER.position = 0
    }
  }
  #init(){
    // this.#refresh("")
    // this.start()
  }
  #refresh(){
      this.setBuffer(this.#TRAM.textToBuffer(this.#SEQUENCER))
  }

  playpause(){
    if(this.#TRANSPORT.running){
      this.stop()
    }
    else{
      if(this.#TRANSPORT.stopped){
        this.start()
      }
      else{
        this.continue()
      }
    }
  }
  // start(){
  //   this.#SEQUENCER.position = 0
  // }
  // continue(){
    
  // }
  // stop(){
    
  // }
	#updateTempo(){
    let tempo = this.#CLOCK.tempo
    if(tempo > 0){
      this.#CLOCK.changeTimestamp = performance.now()
      this.#TRANSPORT.running = false
      this.#createLoop()
      setTimeout(function () {
        if(performance.now() - this.#CLOCK.changeTimestamp > 100){
          this.#TRANSPORT.running = true
        }
      }.bind(this), 200)
    }
  }
  setOperators(operators){
    this.#SEQUENCER.operators = operators
  }
  setBuffer(buffer){
    this.#SEQUENCER.buffer = buffer
  }


  #createLoop(){
    this.#removeLoop()
    this.#CLOCK.pulses = this.#CLOCK.type ? 48 : 24
    this.#CLOCK.time = 60000 / this.#CLOCK.tempo / this.#CLOCK.pulses
    this.#CLOCK.start = performance.now()
    this.#CLOCK.lastframe = 0
    if(!this.#CLOCK.external){
      this.#CLOCK.interval = setInterval(function(){
        this.tick()
      }.bind(this), this.#CLOCK.time * 0.25)
    }
  }
  #removeLoop(){
    if(this.#CLOCK.interval){
      clearInterval(this.#CLOCK.interval)
    }
  }
  tick(){
    let timestamp = performance.now() - this.#CLOCK.start
    let frame = Math.floor(timestamp / this.#CLOCK.time)
    if(frame > this.#CLOCK.lastframe){
      this.#CLOCK.lastframe = frame
      if(this.#TRANSPORT.running){
        let delta = timestamp % this.#CLOCK.time
        let pulse = frame % (this.#CLOCK.pulses * 0.25)
        if(pulse < this.#CLOCK.lastpulse){
          this.#play(delta)
          this.#SEQUENCER.position++
          this.#CLOCK.lastpulse = 0
        }
        else{
          this.#CLOCK.lastpulse = pulse
        }
        this.#IO.tick() 
      }
    }
  }
	#play(delta){
    delta += performance.now() + this.#CLOCK.delay + (this.#CLOCK.time * this.#CLOCK.pulses * 0.25) //lookahead
    for(let line of this.#SEQUENCER.buffer){
        let p = (this.#SEQUENCER.position + 1) % line.length //lookahead
        if(line[p] && this.#SEQUENCER.operators[line[p]]){
          this.#IO.send(this.#SEQUENCER.operators[line[p]],delta)
        }
    }
  }
}