export class TRAM{


	static NOTES = "CcDdEFfGgAaH"

	#OPERATORS = {}
  #MAPPINGS = {}
  #WRAPPER
  #MODE = 2

	constructor(wrapper) {
    this.#WRAPPER = wrapper
  }
  
  setMappings(mappings){
    this.#MAPPINGS = mappings
  }
  setOperators(o){
  	this.#OPERATORS = o
    this.#WRAPPER.setOperators(o)
  }
  setTerminalMode(mode){
    mode = mode % 3
    this.#MODE = mode
  }
  updateOperators(mappings){
    this.setOperators({
        ...mappings,
        ...this.#MAPPINGS
    })
  }
  textToBuffer(text){
    let buffer = []
    let mappings = {}
    this.updateOperators(mappings)
    let input = text
    let lines = input.split('\n')
    let included = []
    for(let l in lines){
      let line = lines[l]
      let words = line.split(' ')
      if(line.charAt(0) == "#"){
        //comment
      }
      else{
        if(words.length > 1 && this.#MODE != 0){ //only when there was at least one space character a mapping could happen
          let operator = words[0] //interpretes the first word as the operator
          let command = words[1] //interpretes the second one as the command
          let midi = command.split(/:|,|\.|\-|\|/) //tries to cast the command to midi
          let validMidi = midi.length == 3
          if(!this.#OPERATORS[operator]){ //only if the word hasnt been mapped yet
            if(validMidi && this.#MODE == 2){ //when the cast to midi was successfull
              midi[0] = isNaN(Number(midi[0])) ? 1 : Number(midi[0])
              if(midi[0] < 128){
                let channel = Math.max(1,Math.min(midi[0],16))
                midi[0] = channel + 143
              }
              if(isNaN(Number(midi[1]))){
                let n = midi[1].split("")
                let note = TRAM.NOTES.indexOf(n[0]) ? TRAM.NOTES.indexOf(n[0]) : 0
                let octave = Number(n[1]) >= 0 && n[1] <= 9 ? Number(n[1]) * 12 : 48
                midi[1] = octave + note
              }
              else{
                midi[1] = Number(midi[1])
              }
              midi[2] = isNaN(Number(midi[2])) ? 100 : Number(midi[2])
              mappings[operator] = midi
              this.updateOperators(mappings)
              words.splice(0,2)
            }
            else if(!validMidi){
              mappings[operator] = command
              this.updateOperators(mappings)
              words.splice(0,2)
            }

          }
        }
        let allops = Object.keys(this.#OPERATORS).sort((a, b) => {
          if (a.length < b.length) {
            return 1;
          }
          if (a.length > b.length) {
            return -1;
          }
          return 0;
        });
        if(words.length > 0){ //if there are still words left to map
          let lastR = 10
          let r = 0
          let array
          while(r <= lastR){
            array = []
            for(let w in words){
              let word = words[w]
              let found = false
              for(let operator of allops){ //iterate over all operators
                if(word.includes(operator)){ //when the word includes an operator
                  found = true
                  let command = this.#OPERATORS[operator]
                  // if(r != lastR){
                    let b = word.slice(0,word.indexOf(operator))
                    let a = word.slice(word.indexOf(operator)+operator.length)
                    word = []
                    if(b){
                      array.push(...b.split(""))
                    }
                    array.push(typeof command == "string" ? command : operator)
                    if(a){
                      array.push(...a.split(""))
                    }
                }
              }
              if(!found){
                array.push(...word.split(""))
              }
            }
            words = array
            r++
          }
          let symbols = words
          let bars = []
          while(symbols.length){
            if(symbols.length > 16){
              bars.push(symbols.splice(0, 16))
            }
            else{
              bars.push(symbols)
              symbols = false
            }
          }
          symbols = words
          while(bars.length){
            let bar = ["","","","","","","","","","","","","","","",""]
            let b = bars.splice(0,1)[0]
            let m = 16 / b.length
            let n = 0
            while(b.length){
              let c = b.splice(0,1)[0]
              bar[Math.floor(m*n)] = c
              n++
            }
            symbols = symbols.concat(bar)
          }
          buffer.push(symbols)
        }
      }
      this.updateOperators(mappings)
    }
    return buffer
  }
}