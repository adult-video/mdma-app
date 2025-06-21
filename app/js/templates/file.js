module.exports = {
	filename: "",
	filetype: "mdma",
	input: "",
	io: {},
	acid: {
		shader: "",
		config: {}
	},
	transport: {
		running: false,
		stopped: true,
		delay: 0
	},
	config: {
	    clock: {
		    tempo: 128,
		    source: false,
		    type: true
		  },
		  io: {
		    transport: {
		      send: true,
		      recieve: false
		    },
		    clock: {
		      send: true,
		      recieve: false
		    }
		  }
	}
}