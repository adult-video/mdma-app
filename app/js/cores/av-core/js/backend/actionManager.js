module.exports = class ActionManager{

  #ACTIONS
  #DEFAULT

  constructor(actions,defaultAction){
    this.#ACTIONS = actions
    this.#DEFAULT = defaultAction
  }
  action(label){
    let f = label.replaceAll(" ","")
    if(this.#ACTIONS[f]){
      this.#ACTIONS[f]()
    }
    else{
      this.#DEFAULT(f)
    }
  }
}