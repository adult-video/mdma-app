import {GLWrapper} from './glWrapper.js'
import mainShader from "./shaders/main.js"
import vertexShader from "./shaders/vertex.js"
import helperShader from "./shaders/helper.js"

export class ACIDViewer{
	#canvas = false
	#shaders = {}
	GL

	constructor(seed) {
    	this.#canvas = document.createElement("canvas")
    	document.body.appendChild(this.#canvas)
    	this.#shaders.main = mainShader
    	this.#shaders.vertex = vertexShader
    	this.#shaders.helper = helperShader
    	this.GL = new GLWrapper(this.#canvas,this.#shaders)
  	}
  	update(config){
  		this.#refresh(config)
  	}
  	#refresh(config){
      	this.#shaders.main = this.#shaders.main.slice(0,this.#shaders.main.indexOf("gl_FragColor")) + "gl_FragColor =" + config.acid.shader + ";}"
      	this.GL.refresh(this.#shaders,config,config.acid.parameters)
  	}
}