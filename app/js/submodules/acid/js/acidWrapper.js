import {ACID} from './acid.js'
import {GLWrapper} from './glWrapper.js'
import {Recorder} from './recorder.js'
import mainShader from "./shaders/main.js"
import vertexShader from "./shaders/vertex.js"
import helperShader from "./shaders/helper.js"

export class ACIDWrapper{
	#canvas = false
	#shaders = {}

	ACIDModule
	GL
	#RECORDER
	EXPORT = {
		recorder: {
			start: (onstop) => {
				this.#RECORDER.startRecording(onstop)
			},
			stop: () => {
				this.#RECORDER.stopRecording()
			}
		}
	}


	constructor() {
    	this.#canvas = document.createElement("canvas")
    	document.body.appendChild(this.#canvas)
    	this.#shaders.main = mainShader
    	this.#shaders.vertex = vertexShader
    	this.#shaders.helper = helperShader
    	this.GL = new GLWrapper(this.#canvas,this.#shaders)
    	this.ACID = new ACID(this.GL)
    	this.#RECORDER = new Recorder(this.#canvas)
  	}

  	get fragmentShader(){
  		return this.GL.fragmentShader
  	}
  	get canvas(){
  		return this.#canvas
  	}
  	update(config){
  		if(config){
  			this.GL.parameters.bpmDivisor = 1/(60*1000/config.config.clock.tempo*4)
  		}
  		return this.#refresh(config)
  	}
  	#init(){
  		// this.#refresh()
  	}
  	#refresh(config){
      	let n = this.ACID.update(config)
      	this.#shaders.main = this.#shaders.main.slice(0,this.#shaders.main.indexOf("gl_FragColor")) + "gl_FragColor =" + n + ";}"
      	let p = this.GL.refresh(this.#shaders,config)
      	return {
      		shader: n,
      		parameters: p
      	}
  	}
}