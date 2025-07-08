export class IOWrapper{
  
  static defaultinterfaces = [
    {
      type: "empty",
      name: "None",
      interface: null,
      input: true,
      output: true
    }
  ]

  #IO = {
    IN: {
      list:[],
      selected: 0,
      module: null
    },
    OUT: {
      list:[],
      selected: 0,
      module: null
    },
  }

  #CONFIG = {
    transport: {
      send: false,
      recieve: false,
      running: false,
      stopped: true
    },
    clock: {
      send: false,
      recieve: false
    },
  }

  #MODULES = {
    extras: [],
    console: {},
    midi: null
  }
  #RECIEVERS = {
    transport: [],
    clock: []
  }

  constructor(){
    this.#init()
  }

  #init(){
    this.refresh()
    let onMidiSuccess = function(midi){
      this.#MODULES.midi = midi
      this.refresh()
    }.bind(this)
    let onMIDIFailure = function(){
      console.log( "Failed to get MIDI access - " + msg )
    }
    navigator.requestMIDIAccess().then(onMidiSuccess,onMIDIFailure)
  }

  update(file){
    this.#CONFIG.transport.send = file.config.io.transport.send
    this.#CONFIG.transport.recieve = file.config.io.transport.recieve
    this.#CONFIG.clock.send = file.config.io.clock.send
    this.#CONFIG.clock.recieve = file.config.io.clock.recieve
    if(this.#CONFIG.transport.running != file.transport.running){
      this.#CONFIG.transport.running = file.transport.running
      if(this.#CONFIG.transport.stopped == file.transport.stopped){
        if(this.#CONFIG.transport.running){
          this.continue()
        }
        else{
          this.pause()
        }
      }
      
    }
    if(this.#CONFIG.transport.stopped != file.transport.stopped){
      this.#CONFIG.transport.stopped = file.transport.stopped
      if(this.#CONFIG.transport.stopped){
        this.stop()
      }
      else{
        this.start()
      }
    } 
  }

  refresh(){
    this.#clearIO()
    for (var a of IOWrapper.defaultinterfaces) {
      if(a.input){
        this.#IO.IN.list.push(a)
      }
      if(a.output){
        this.#IO.OUT.list.push(a)
      }
    }
    for (var m of this.#MODULES.extras) {
      if(m.input){
        this.#IO.IN.list.push(m)
      }
      if(m.output){
        this.#IO.OUT.list.push(m)
      }
    }
    if(this.#MODULES.midi){
      for (var entry of this.#MODULES.midi.inputs) {
        this.#IO.IN.list.push({
          type: "midi",
          name: entry[1].name,
          interface: entry[1]
        })
      }
      for (var entry of this.#MODULES.midi.outputs) {
        this.#IO.OUT.list.push({
          type: "midi",
          name: entry[1].name,
          interface: entry[1]
        })
      }
    }
    this.#IO.IN.selected = this.#IO.IN.selected >= this.#IO.IN.list.length ? 0 : this.#IO.IN.selected
    this.#IO.OUT.selected = this.#IO.OUT.selected >= this.#IO.OUT.list.length ? 0 : this.#IO.OUT.selected
    this.#updateIO()
    return this.#exposeIOState()
    
  }
  #exposeIOState(){
    return {
      in: {
        selected: {
          label: this.#IO.IN.list[this.#IO.IN.selected].name,
          index: this.#IO.IN.selected + 1
        },
        available: this.#IO.IN.list.length
      },
      out: {
        selected: {
          label: this.#IO.OUT.list[this.#IO.OUT.selected].name,
          index: this.#IO.OUT.selected + 1
        },
        available: this.#IO.OUT.list.length
      },
    }
  }
  #clearIO(){
    if(this.#IO.IN.module){
      if(this.#IO.IN.module.type == "midi"){
        this.#IO.IN.module.interface.onmidimessage = null
        if(this.#IO.IN.module.interface.state != "closed"){
          this.#IO.IN.module.interface.close()
        }
      }
    }
    if(this.#IO.OUT.module){
      if(this.#IO.OUT.module.type == "midi"){
        if(this.#IO.OUT.module.interface.state != "closed"){
          this.#IO.OUT.module.interface.close()
        }
      }
    }
    this.#IO.IN.list = []
    this.#IO.OUT.list = []
  }
  #updateIO(){
    this.#IO.IN.module = this.#IO.IN.list[this.#IO.IN.selected]
    this.#IO.OUT.module = this.#IO.OUT.list[this.#IO.OUT.selected]
    if(this.#IO.IN.module.type == "midi"){
      this.#IO.IN.module.interface.onmidimessage = function(m) {
        this.recieveData(m.data)
      }.bind(this)
      if(this.#IO.IN.module.interface.state == "closed"){
        this.#IO.IN.module.interface.open()
      }
    }
    if(this.#IO.OUT.module.type == "midi"){
      if(this.#IO.OUT.module.interface.state == "closed"){
        this.#IO.OUT.module.interface.open()
      }
    }
  }
  #changeIO(io,d){
    io = io ? "OUT" : "IN"
    this.#IO[io].selected = ((this.#IO[io].list.length) + this.#IO[io].selected + d) % (this.#IO[io].list.length)
    this.refresh()
  }
  changeInput(d){
    this.#changeIO(0,d)
  }
  changeOutput(d){
    this.#changeIO(1,d)
  }
  nextInput(){
    this.#changeIO(0,1)
  }
  prevInput(){
    this.#changeIO(0,-1)
  }
  nextOutput(){
    this.#changeIO(1,1)
  }
  prevOutput(){
    this.#changeIO(1,-1)
  }

  recieveData(data){
    switch(this.#IO.IN.module.type){
      case "console":
        console.log("recived " + data)
        break
      case "midi":
        let fb = data[0]
        
        if(fb != 248){
          // console.log(data)
        }
        switch(fb){
          case 248: 
            if(this.#CONFIG.clock.recieve){
              for(let r of this.#RECIEVERS.clock){
                r.tick()
              }
            }
            break
          case 250: //start/play from stop
            if(this.#CONFIG.transport.recieve){
              for(let r of this.#RECIEVERS.transport){
                r.start()
              }
            }
            break
          case 251: //continue/play from wherever
            if(this.#CONFIG.transport.recieve){
              for(let r of this.#RECIEVERS.transport){
                r.continue()
              }
            }
            break
          case 252: //stop/pause
            if(this.#CONFIG.transport.recieve){
              for(let r of this.#RECIEVERS.transport){
                r.stop()
              }
            }
            break
        }
        break
    }
  }
  tick(delta){
    delta = delta || 0
    if(this.#CONFIG.clock.send){
      switch(this.#IO.OUT.module.type){
      case "console":
        console.log("tick")
        break
      case "midi":
        this.send([0xF8], delta)
        break
      }
    }
  }
  start(){
    if(this.#CONFIG.transport.send){
      switch(this.#IO.OUT.module.type){
        case "console":
          console.log("started")
          break
        case "midi":
          this.send([0xFF])
          this.send([0xFA]) 
          break
      }
    }
  }
  continue(){
    if(this.#CONFIG.transport.send){
      switch(this.#IO.OUT.module.type){
        case "console":
          console.log("continued")
          break
        case "midi":
          this.send([0xFB])
          break
      }
    }
  }
  pause(){
    if(this.#CONFIG.transport.send){
      switch(this.#IO.OUT.module.type){
        case "console":
          console.log("paused")
          break
        case "midi":
          this.send([0xFC])
          break
      }
    }
  }
  stop(){
    if(this.#CONFIG.transport.send){
      switch(this.#IO.OUT.module.type){
        case "console":
          console.log("stopped")
          break
        case "midi":
          this.send([176,123,0])
          this.send([177,123,0])
          this.send([178,123,0])
          this.send([179,123,0])
          this.send([180,123,0])
          this.send([181,123,0])
          this.send([182,123,0])
          this.send([183,123,0])
          this.send([184,123,0])
          this.send([185,123,0])
          this.send([186,123,0])
          this.send([187,123,0])
          this.send([188,123,0])
          this.send([189,123,0])
          this.send([190,123,0])
          this.send([191,123,0])
          this.send([0xFC])
          this.send([0xFF])
          this.#IO.OUT.module.interface.clear()
          break
      }
    }
  }
  send(data,delta){
    switch(this.#IO.OUT.module.type){
      case "console":
        console.log(data)
        break
      case "sampler":
        this.#IO.OUT.module.interface.play(data,delta)
        break
      case "midi":
        if(this.#IO.OUT.module.interface.send){
          let func = data[0]
          if(143 < func && func < 160){
            this.#IO.OUT.module.interface.send([func - 16,data[1],data[2]])
          }
          this.#IO.OUT.module.interface.send(data,delta)
        }
        break 
    }
  }
  addModule(m){
    this.#MODULES.extras.push(m)
    this.refresh()
  }
  addTransportReciever(r){
    this.#RECIEVERS.transport.push(r)
  }
  addClockReciever(r){
    this.#RECIEVERS.clock.push(r)
  }
}