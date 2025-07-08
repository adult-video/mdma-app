export class TRAM{


	static NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
  static VELOCITYS = [1,20,40,60,80,100,127]
  static DEFAULT_MAPPING = [144,48,100]

	#OPERATORS = {}
  #MAPPINGS = {}
  #WRAPPER

	constructor(wrapper) {
    this.#WRAPPER = wrapper
  }

  static channelToData0(data){
    data = isNaN(Number(data)) ? 1 : Number(data)
    if(data < 128){
      let channel = Math.max(1,Math.min(data,16))
      data = channel + 143
    }
    return data
  }
  static data0ToChannel(data){
    if(data > 143 && data < 160){
      data = data - 143
    }
    return data
  }
  static noteToData1(data){
    if(isNaN(Number(data))){
      let n = [data.slice(0,data.length-1),data.slice(-1)]
      let octave = Number(n[1]) >= 0 && n[1] <= 9 ? Number(n[1]) * 12 : 48
      let note = TRAM.NOTES.indexOf(n[0])
      data = octave + note
    }
    else{
      data = Number(data)
    }
    return data
  }
  static noteToIndex(note){
    return Math.min(12,Math.max(TRAM.NOTES.indexOf(note),0))
  }
  static data1ToNote(data){
    let note = TRAM.NOTES[data % 12]
    let octave = Math.floor(data / 12)
    return "" + note + octave
  }
  static data1ToNoteAndOctave(data){
    let note = TRAM.NOTES[data % 12]
    let octave = Math.floor(data / 12)
    return [note,octave]
  }
  static velocityToData2(data){
    data = isNaN(Number(data)) ? 100 : Number(data)
    data = Math.max(1,Math.min(127,data))
    return data
  }
  static data2ToVelocity(data){
    return data
  }
  
  setMappings(mappings){
    this.#MAPPINGS = mappings
  }
  setOperators(o){
  	this.#OPERATORS = o
    this.#WRAPPER.setOperators(o)
  }
  updateOperators(mappings){
    this.setOperators({
        ...mappings,
        ...this.#MAPPINGS
    })
  }
  textToBuffer(config){
    this.#MAPPINGS = config.mapping
    let buffer = []
    let mappings = {}
    this.updateOperators(mappings)
    let input = config.input
    let lines = input.split('\n')
    let included = []
    for(let l in lines){
      let line = lines[l]
      let words = line.split(' ')
      if(line.charAt(0) == config.commentIndicator){
        //comment
      }
      else{
        if(line.includes(config.mappingIndicator)){ //only when there was at least one space character a mapping could happen
          let m = line.split(config.mappingIndicator)
          let operator = m[0] //interpretes the first word as the operator
          let command = m[1] //interpretes the second one as the command
          let midi = command.split(config.dataDelimiter) //tries to cast the command to midi
          let validMidi = midi.length == 3
          if(!this.#OPERATORS[operator]){ //only if the word hasnt been mapped yet
            if(validMidi){ //when the cast to midi was successfull
              midi[0] = TRAM.channelToData0(midi[0])
              midi[1] = TRAM.noteToData1(midi[1])
              midi[2] = TRAM.velocityToData2(midi[2])
              mappings[operator] = midi
              this.updateOperators(mappings)
              // words.splice(0,2)
              words = []
            }
            else if(!validMidi){
              mappings[operator] = command
              this.updateOperators(mappings)
              // words.splice(0,2)
              words = []
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
                      // array.push(...b.split(""))
                      array.push(b)
                    }
                    array.push(typeof command == "string" ? command : operator)
                    if(a){
                      // array.push(...a.split(""))
                      array.push(a)
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