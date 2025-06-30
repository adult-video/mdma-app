export class Sampler{
	#ctx
	#BASEPATH
	#CHANNELS = {}
	#SAMPLES = []

	get ready(){
		return Object.keys(this.#CHANNELS).length == this.#SAMPLES.length
	}

	constructor(basepath,samples){
		this.#BASEPATH = basepath
		this.#SAMPLES = samples
		this.#init()
	}
	#init(){
		this.#ctx = new AudioContext()
		this.#loadSamples()
	}
	#loadSamples(){
		let samplesLoaded = this.#SAMPLES.length
		for(let i = 0; i < this.#SAMPLES.length; i++){
			let s = this.#SAMPLES[i]
			let source = this.#BASEPATH + s
			fetchAudio(source).then((data) => {
				this.#ctx.decodeAudioData(data, (b)=>{this.#storeBufferToChannel(b,i)}, (b)=>{onDecodeError(b)})
			})
		}
		function fetchAudio(url) {
		  return new Promise((resolve, reject) => {
		    const request = new XMLHttpRequest();
		    request.open("GET", url, true);
		    request.responseType = "arraybuffer";
		    request.onload = () => resolve(request.response);
		    request.onerror = (e) => reject(e);
		    request.send();
		  })
		}
		function onDecodeError(e) {
		  console.log("Error decoding buffer: " + e.message)
		}
	}
	#storeBufferToChannel(buffer,channel) {
		this.#CHANNELS[channel] = {
			buffer:buffer,
			sample: null
		}
	}
	play(data,time){
		let c = data[0]-144 //channel
		let p = (48-data[1])/12 * -1200 //pitch
		let g = data[2] / 127 //velocity
		if(this.#CHANNELS[c]){
			if(this.#CHANNELS[c].sample){
				this.#CHANNELS[c].sample.stop()
				this.#CHANNELS[c].sample = null
			}
			let gain = new GainNode(this.#ctx)
			let sample = this.#ctx.createBufferSource()
			sample.buffer = this.#CHANNELS[c].buffer
			sample.connect(gain).connect(this.#ctx.destination)
			sample.detune.value = p
			gain.gain.value = g
			sample.onended = (channel) => {
				this.#CHANNELS[c].sample = null
			}
			sample.start()
		}
	}
	//CONFORM TO IO INTERFACE
	send(data,time){
		this.play(data,time)
	}
	tick(){}
	start(){}
	stop(){
		for(let c of this.#CHANNELS){
			if(c.sample){
				c.sample.stop()
				c.sample = null
			}
		}
	}
	continue(){}
}