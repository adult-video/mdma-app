const path = require("path")
const fs = require("fs")
const storage = require("electron-json-storage")
const {dialog,app} = require("electron")

module.exports = class FSManager{
  #DEFAULTFILE = {}
  #FILE = {
    content: {},
    type: app.name.toLowerCase(),
    name: "untitled"
  }

  constructor(type,defaultfile){
    this.#FILE.type = type
    this.#DEFAULTFILE = defaultfile || {}
    this.#init()
  }

  get type() {
    return this.#FILE.type
  }
  get name() {
    return this.#FILE.name
  }

	static isNotEmpty(obj){
    return !(obj && Object.keys(obj).length === 0 && obj.constructor === Object)
  }

  #init(){
    storage.get(this.#FILE.type, function(error, data) {
      if(error){
        throw error
      }
      else if(!FSManager.isNotEmpty(data)){
        console.log("Storage file was empty or corrupted, replaced with default")
        this.#reset()
      }
      else{
        this.#FILE.content = JSON.parse(data)
        console.log("Storage file updated")
        // this.#reset()
        this.#save()
      }
    }.bind(this))
  }
  refresh(){
    storage.get(this.#FILE.type, function(error, data) {
      if(error){
        throw error
      }
      else if(!FSManager.isNotEmpty(data)){
        console.log("Storage file was empty or corrupted, replaced with default")
        this.#reset()
      }
      else{
        this.#FILE.content = JSON.parse(data)
        this.#FILE.name = this.#FILE.content.filename
        this.#FILE.type = this.#FILE.content.filetype
      }
    }.bind(this))
  }
  #save(){
    this.#FILE.name = this.#FILE.content.filename
    storage.set(this.#FILE.type, JSON.stringify(this.#FILE.content), function(error) {
      if (error){
        console.log("Error storing JSON " + error)
      }
    })
  }
  saveToDiskWithPath(path,callback){
    this.refresh()
    try {
      fs.writeFileSync(path, JSON.stringify(this.#FILE.content), 'utf-8')
    }
    catch(error){
      if(callback){
        callback(error)
      }
    }
  }
  openFromDiskWithPath(path,callback){
    fs.readFile(path, 'utf-8', (err, data) => {
      if(err){
        if(callback){
          callback("An error ocurred reading the file :" + err.message)
        }
        return
      }
      else{
        let file = JSON.parse(data)
        this.#FILE.name = file.filename
        this.#FILE.type = file.filetype
        this.#FILE.content = file
        this.#save()
        if(callback){
          callback()
        }
      }
    })
  }
  overwrite(file){
    this.#FILE.name = file.filename
    this.#FILE.type = file.filetype
    this.#FILE.content = file
    this.#save()
  }
  #reset(){
    this.#FILE.content = this.#DEFAULTFILE
    this.#save()
  }
}
