const app = require("electron").remote.app
const storage = require("electron-json-storage")

export class FSWrapper{
	#FILE = {
		filename: "untitled",
		content: {},
		type: "config"
	}

	constructor(callback){
		this.#FILE.type = app.name.toLowerCase()	
		this.update(callback)
	}
	get(key){
		if(key){
			return this.#FILE.content[key]
		}
		else{
			return this.#FILE.content
		}
	}
	update(callback){
	    storage.get(this.#FILE.type, function(error, data) {
	      if(error){
	        throw error
	      }
	      else{
	      	let content = JSON.parse(data)
	      	console.log(content)
	      	this.#FILE.type = content.filetype
	        this.#FILE.content = content
	        this.#FILE.name = content.filename
	        if(callback){
	        	callback()
	        }
	       }
	    }.bind(this))
	}
	save(content,callback){
		content.filetype = this.#FILE.type
		this.#FILE.name = content.filename
		this.#FILE.content = content
	    storage.set(this.#FILE.type, JSON.stringify(this.#FILE.content), function(error) {
	      if (error){
	        throw error
	      }
	      else{
	      	if(callback){
	        	callback()
	        }
	      }
	    }.bind(this));
	}
	export(){
	    let blob = new Blob([JSON.stringify(this.#FILE.content)], {type: 'text/plain'})
	    const url = window.URL.createObjectURL(blob)
	    const a = document.createElement('a')
	    a.style.display = 'none'
	    a.href = url
	    a.download = this.#FILE.name.toLowerCase() + "." + this.#FILE.type
	    document.body.appendChild(a)
	    a.click()
	    setTimeout(() => {
	        document.body.removeChild(a)
	        window.URL.revokeObjectURL(url)
	    }, 100)
	}
}