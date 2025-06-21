import {ACID} from './acid.js'
import {GLWrapper} from './glWrapper.js'
import mainShader from "./shaders/main.js"
import vertexShader from "./shaders/vertex.js"
import helperShader from "./shaders/helper.js"

export class ACIDWrapper{
	#seed = 0
	#canvas = false
	#shaders = {}
	ACIDModule
	GL

	constructor(seed) {
    	this.#seed = seed || 0;
    	this.#canvas = document.createElement("canvas")
    	document.body.appendChild(this.#canvas)
    	this.#shaders.main = mainShader
    	this.#shaders.vertex = vertexShader
    	this.#shaders.helper = helperShader
    	this.GL = new GLWrapper(this.#canvas,this.#shaders)
    	this.ACID = new ACID(this.#seed,this.GL)
    	// this.#init()
  	}
  	update(config){
  		if(config){
  			this.GL.parameters.bpmDivisor = 1/(60*1000/config.config.clock.tempo*4)
  		}
  		return this.#refresh(config)
  	}
  	#init(){
  		this.#refresh()
  	}
  	#refresh(config){
      	let n = this.ACID.update(config.input)
      	this.#shaders.main = this.#shaders.main.slice(0,this.#shaders.main.indexOf("gl_FragColor")) + "gl_FragColor =" + n + ";}"
      	this.GL.refresh(this.#shaders,config)
      	return n
  	}
}