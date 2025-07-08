export class GLWrapper{
  #initialised = false
  #canvas = false
  #seed = 0
  #gl = false
  #locations = {}
  parameters = {}
  #shaders = {}

  constructor(canvas,shaders,seed){
    this.#seed = seed || 0
    this.#canvas = canvas
    this.#shaders = shaders
    this.parameters = {
      startTime: new Date().getTime(),
      delay: 0,
      running: false,
      time: 0,
      seed: Math.random(),
      screenWidth : 0,
      screenHeight: 0,
      screenSize: 0,
      mouseX: 0,
      mouseY: 0,
      bitmap: new Float32Array([]),
      bitmapSize: 0,
      slBitmaps: new Float32Array([]),
      slBitmapSizes: new Float32Array([]),
      spacePressed: 0,
      bpmDivisor: 1/(60*1000/128*4)
    }
    this.#init()
  }

    get fragmentShader(){
      return this.#locations.fragment_shader
    }

  #init(){
    if(!this.#initialised){
      window.addEventListener("resize",this.#resize.bind(this));
      window.addEventListener("mousemove",this.#handle.move.bind(this));
      window.addEventListener("keydown",this.#handle.keyDown.bind(this));
      window.addEventListener("keyup",this.#handle.keyUp.bind(this));
    }
    try {
      this.#gl = this.#canvas.getContext('webgl', {preserveDrawingBuffer: true});
    }
    catch(error){}
    if(!this.#gl){
      throw "cannot create webgl context";
    }
    if(!this.#initialised){
        this.#resize()
        this.#initialised = true
    }
    this.#animate()
  }
  #handle = {
    move: function(e){
      this.parameters.mouseX = e.clientX / this.parameters.screenWidth
      this.parameters.mouseY = e.clientY / this.parameters.screenHeight
    },
    keyDown: function(e){
      // if(e.keyCode == 32){
        // e.preventDefault()
        this.parameters.spacePressed = true
      // }
    },
    keyUp: function(e){
      // if(e.keyCode == 32){
        this.parameters.spacePressed = false
      // }
    }    
  }
  #resize(){
      if (this.#canvas.width != this.#canvas.clientWidth || this.#canvas.height != this.#canvas.clientHeight ) {
        let scale = 1.0
        this.#canvas.width = this.#canvas.clientWidth / scale;
        this.#canvas.height = this.#canvas.clientHeight / scale;
        this.parameters.screenWidth = this.#canvas.width;
        this.parameters.screenHeight = this.#canvas.height;
        this.parameters.screenSize = Math.max(this.parameters.screenWidth,this.parameters.screenHeight)
        this.#gl.viewport( 0, 0, this.parameters.screenWidth, this.parameters.screenHeight )
      }
  }
  #animate(){
    if(this.parameters.running){
      this.#render()
    }
    window.requestAnimationFrame(this.#animate.bind(this))
  }
  refresh(shaders,config,parameters){
    if(parameters){
      this.parameters = parameters
    }
    else{
      this.parameters.running = config.transport.running
      this.parameters.delay = config.transport.delay
      if(config.transport.stopped){
        this.parameters.startTime = new Date().getTime()
      }
    }
    this.#locations.vertex_shader = shaders.vertex
    this.#locations.fragment_shader = shaders.helper + "\n" + shaders.main
    this.#locations.buffer = this.#gl.createBuffer()
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#locations.buffer )
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array( [ - 1.0, - 1.0, 1.0, - 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0 ] ), this.#gl.STATIC_DRAW )
    this.#createProgram(this.#locations.vertex_shader,this.#locations.fragment_shader)
    this.#locations.timeLocation = this.#gl.getUniformLocation(this.#locations.program,"time")
    this.#locations.resolutionLocation = this.#gl.getUniformLocation(this.#locations.program,"resolution")
    this.#locations.mouseLocation = this.#gl.getUniformLocation(this.#locations.program,"mouse");
    this.#locations.seedLocation = this.#gl.getUniformLocation(this.#locations.program,"seed")
    this.#locations.sizeLocation = this.#gl.getUniformLocation(this.#locations.program,"size")
    this.#locations.bitmapLocation = this.#gl.getUniformLocation(this.#locations.program,"bitmap")
    this.#locations.bitmapSizeLocation = this.#gl.getUniformLocation(this.#locations.program,"bitmapSize")
    this.#locations.slBitmapsLocation = this.#gl.getUniformLocation(this.#locations.program,"slBitmaps")
    this.#locations.slBitmapSizesLocation = this.#gl.getUniformLocation(this.#locations.program,"slBitmapSizes")
    this.#locations.spacePressedLocation = this.#gl.getUniformLocation(this.#locations.program,"spacePressed")
    if(!this.parameters.running){
      this.#render()
    }
    return this.parameters
  } 
  #createShader( src, type ) {
    let shader = this.#gl.createShader(type)
    this.#gl.shaderSource( shader, src )
    this.#gl.compileShader( shader )
    return shader
  }
  #createProgram( vertex, fragment ) {
    this.#locations.program = this.#gl.createProgram()
    let vs = this.#createShader( vertex, this.#gl.VERTEX_SHADER )
    let fs = this.#createShader( '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment, this.#gl.FRAGMENT_SHADER )
    this.#gl.attachShader(this.#locations.program,vs)
    this.#gl.attachShader(this.#locations.program,fs)
    this.#gl.deleteShader(vs)
    this.#gl.deleteShader(fs)
    this.#gl.linkProgram(this.#locations.program)
  }
  #render(){
    if(!this.#locations.program){
      console.log("no program location")
      return
    }
    this.parameters.time = new Date().getTime() - this.parameters.startTime + this.parameters.delay
    let t = this.parameters.time  * this.parameters.bpmDivisor
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT|this.#gl.DEPTH_BUFFER_BIT)
    this.#gl.useProgram(this.#locations.program)
    this.#gl.uniform1f(this.#locations.timeLocation,t)
    this.#gl.uniform2f(this.#locations.resolutionLocation,this.parameters.screenWidth,this.parameters.screenHeight)
    this.#gl.uniform2f(this.#locations.mouseLocation,this.parameters.mouseX,this.parameters.mouseY)
    this.#gl.uniform1f(this.#locations.seedLocation,this.parameters.seed)
    this.#gl.uniform1f(this.#locations.sizeLocation,this.parameters.screenSize)
    this.#gl.uniform1fv(this.#locations.bitmapLocation,new Float32Array(this.parameters.bitmap))
    this.#gl.uniform1i(this.#locations.bitmapSizeLocation,this.parameters.bitmapSize)
    this.#gl.uniform1fv(this.#locations.slBitmapsLocation,new Float32Array(this.parameters.slBitmaps))
    this.#gl.uniform1fv(this.#locations.slBitmapSizesLocation,new Float32Array(this.parameters.slBitmapSizes))
    this.#gl.uniform1i(this.#locations.spacePressedLocation,this.parameters.spacePressed)
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER,this.#locations.buffer)
    this.#gl.vertexAttribPointer(this.#locations.vertexPosition,2,this.#gl.FLOAT,false,0,0)
    this.#gl.enableVertexAttribArray(this.#locations.vertexPosition)
    this.#gl.drawArrays(this.#gl.TRIANGLES,0,6)
    this.#gl.disableVertexAttribArray(this.#locations.vertexPosition)
  }
}
