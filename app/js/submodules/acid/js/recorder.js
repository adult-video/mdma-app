export class Recorder{
	#chunks
	#stream
	#device
	#canvas

	constructor(canvas){
		this.#canvas = canvas
	}

	startRecording(onstop){
		this.#chunks = []
      	this.#stream = this.#canvas.captureStream(30)
      	this.#device = new MediaRecorder(this.#stream, { mimeType: "video/webm; codecs=vp9" })
      	this.#device.ondataavailable = (e) => { this.#chunks.push(e.data); }
      	this.#device.onstop = () => {
      		onstop(this.#chunks)
      	}
      	this.#device.start(1000)
	}
	stopRecording(){
		if(this.#device){
			this.#device.stop()
			this.#device = null
		}
	}
}