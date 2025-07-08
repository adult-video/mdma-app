export class GUIWrapper{
	#BUTTONS = {}
	#DISPLAYS = {}

	constructor(buttons,displays){
		this.#BUTTONS = buttons
		this.#DISPLAYS = displays
		this.#connect()
  	}
  	static isValidCharacterKeyCode(code){
  		return code >= 48 && code != 91
  	}
  	static getValueFromKeystring(string,obj){
  		let keys = string.split(".")
  		let o = obj
  		if(!o[keys[0]]){
  			return string
  		}
  		for(let key of keys){
  			if(o[key] != null){
  				o = o[key]
  			}
  		}
  		return o
  	}
  	// static setValueFromKeystring(string,obj,value){
  	// 	let keys = string.split(".")
  	// 	let o = obj
  	// 	for(let key of keys){
  	// 		if(o[key] != null){
  	// 			o = o[key]
  	// 		}
  	// 	}
  	// 	o = value
  	// 	console.log(o,obj)
  	// 	return obj
  	// }
  	static setValueFromKeystring(path,value,obj) {
	    var schema = obj
	    var pList = path.split('.')
	    var len = pList.length
	    for(var i = 0; i < len-1; i++) {
	        var elem = pList[i]
	        if(!schema[elem]){
	        	schema[elem] = {}
	        }
	        schema = schema[elem]
	    }
	    schema[pList[len-1]] = value
	    return obj
	}
  	#connect(){
  		let buttons = [].slice.call(document.body.getElementsByClassName("trigger"))
  		for(let button of buttons){
  			let b = button.getAttribute("data-trigger")
  			b = b.toLowerCase()
  			if(this.#BUTTONS[b]){
  				button.addEventListener("click",this.#BUTTONS[b])
  			}
  		}
  	}
  	update(file){
  		document.documentElement.style.fontSize = file.settings.general.fontsize + "px"
  		document.documentElement.style.textAlign = file.settings.general.alignTextCenter ? "center" : "left"
  		for(let display in this.#DISPLAYS){
  			this.#updateLabel(display,GUIWrapper.getValueFromKeystring(this.#DISPLAYS[display],file))	
  		}
  	}
  	#updateLabel(id,text){
  		let label = document.getElementById(id)
  		if(label){
  			if(typeof text == "boolean"){
  				let dFalse = label.getAttribute("data-false")
  				let dTrue = label.getAttribute("data-true")
  				if(dFalse && dTrue){
  					label.innerText = text ? dTrue : dFalse
  				}
  				else{
  					text ? label.classList.add("active") : label.classList.remove("active")
  				}
  			}
  			else{
  				label.innerText = text
  			}
  			
  		}
  	}
  	forceUpdateLabel(id,text){
  		this.#updateLabel(id,text)
  	}
  	#updateState(id,state){
		let container = document.getElementById(id)
  		if(container){
  			container.classList = ""
  			container.classList.add(state)
  		}
  	}
}