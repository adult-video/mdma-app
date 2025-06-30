export class IOWrapper{
  TRAM
  #GUI = false
  
  static defaultinterfaces = [
    {
      type: "empty",
      name: "None",
      interface: null,
      input: true,
      output: true
    },
    {
      type: "console",
      name: "Console",
      interface: null,
      input: false,
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
      send: true,
      recieve: false
    },
    clock: {
      send: true,
      recieve: false
    }
  }

  #MODULES = {
    extras: [],
    console: {},
    midi: null
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
        this.#IO.IN.module.interface.close()
      }
    }
    if(this.#IO.OUT.module){
      if(this.#IO.OUT.module.type == "midi"){
        this.#IO.OUT.module.interface.close()
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
      this.#IO.OUT.module.interface.open()
    }
  }
  #changeIO(io,d){
    io = io ? "OUT" : "IN"
    this.#IO[io].selected = ((this.#IO[io].list.length) + this.#IO[io].selected + d) % (this.#IO[io].list.length)
    this.#updateIO()
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
        break
      case "midi":
        let fb = data[0]
        switch(fb){
          case 248: //start/play from stop
            if(this.#CONFIG.clock.recieve){
              this.TRAM.tick()
            }
            break
          case 250: //start/play from stop
            if(this.#CONFIG.transport.recieve){
              this.TRAM.start()
            }
            break
          case 251: //continue/play from wherever
            if(this.#CONFIG.transport.recieve){
              this.TRAM.continue()
            }
            break
          case 252: //stop/pause
            if(this.#CONFIG.transport.recieve){
              this.TRAM.stop()
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
        if(this.#IO.OUT.module.interface.send){
            this.OUTPUT.send([0xF8], delta)
        } 
        break
      }
    }
  }
  playpause(){
    if(this.#GUI){
      this.#GUI.updateState("transport","paused")
    }
  }
  start(){
    if(this.#CONFIG.transport.send){
      switch(this.#IO.OUT.module.type){
        case "console":
          console.log("started")
          break
        case "midi":
          if(this.#IO.OUT.module.interface.send){
            this.send([0xFF])
            this.send([0xFA])
          }
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
          if(this.#IO.OUT.module.interface.send){
            this.send([0xFB])
          }
          break
      }
    }
    if(this.#GUI){
      this.#GUI.updateState("transport","playing")
    }
  }
  stop(){
    if(this.#CONFIG.transport.send){
      switch(this.#IO.OUT.module.type){
        case "console":
          console.log("continued")
          break
        case "midi":
          if(this.#IO.OUT.module.send){
            this.send([0xFC])
            this.send([0xFF])
          }
          break
      }
    }
    if(this.#GUI){
      this.#GUI.updateState("transport","stopped")
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
          let func = cmd[0]
          if(143 < func && func < 160){
            this.#IO.OUT.module.interface.send([func - 16,cmd[1],cmd[2]])
          }
          this.#IO.OUT.module.interface(cmd,delta)
        }
        break 
    }
  }
  addModule(m){
    this.#MODULES.extras.push(m)
    this.refresh()
  }
}