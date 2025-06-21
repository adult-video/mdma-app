import {TRAM} from './tram.js'

export class TRAMWrapper{
  #IO
  #TRAM

  #SEQUENCER = {
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
    type: true,
    source: false,
    interval: null,
    changeTimestamp: 0
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
    if(file.config.clock.tempo != this.#CLOCK.tempo){
      this.#CLOCK.tempo = file.config.clock.tempo
      tempoUpdateRequired = true
    }
    if(file.config.clock.type != this.#CLOCK.type){
      this.#CLOCK.type = file.config.clock.type
      createLoopRequired = true
    }
    if(file.config.clock.type != this.#CLOCK.type){
      this.#CLOCK.type = file.config.clock.type
      createLoopRequired = true
    }
    if(file.input != this.#SEQUENCER.input){
      this.#SEQUENCER.input = file.input
      refreshRequired = true
    }
    
    if(tempoUpdateRequired){
      this.#updateTempo()
    }
    else if(createLoopRequired){
      this.#createLoop()
    }
    if(refreshRequired){
      this.#refresh()
    }
    
  }
  #init(){
    this.#refresh("")
    this.start()
  }
  #refresh(){
      this.setBuffer(this.#TRAM.textToBuffer(this.#SEQUENCER.input))
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
  start(){
    this.#SEQUENCER.position = 0
    this.#TRANSPORT.running = true
    this.#TRANSPORT.stopped = false
    this.#IO.start()
  }
  continue(){
    this.#TRANSPORT.running = true
    this.#IO.continue()
  }
  stop(){
    this.#TRANSPORT.running = false
    this.#TRANSPORT.stopped = true
    this.#IO.stop()
  }
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
    this.#CLOCK.time = 60000 / tempo / this.#CLOCK.pulses
    this.#CLOCK.start = performance.now()
    this.#CLOCK.lastframe = 0
    this.#CLOCK.interval = setInterval(function(){
      this.#tick()
    }.bind(this), this.#CLOCK.time * 0.25);
  }
  #removeLoop(){
    if(this.#CLOCK.interval){
      clearInterval(this.#CLOCK.interval)
    }
  }
  #tick(){
    let timestamp = performance.now() - this.#CLOCK.start
    let frame = Math.floor(timestamp / this.#CLOCK.time)
    if(frame > this.#CLOCK.lastframe){
      this.#CLOCK.lastframe = frame
      if(this.#TRANSPORT.running){
        let delta = timestamp % this.#CLOCK.TIME
        if(frame % (this.#CLOCK.pulses * 0.25) == 0){
          this.#play(delta)
          this.#SEQUENCER.position++
        }
        this.#IO.tick() 
      }
    }
  }
	#play(delta){
    for(let line of this.#SEQUENCER.buffer){
        let p = this.#SEQUENCER.position % line.length
        if(line[p] && this.#SEQUENCER.operators[line[p]]){
          this.#IO.send(this.#SEQUENCER.operators[line[p]],delta)
        }
    }
  }
}