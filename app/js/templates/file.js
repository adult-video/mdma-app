module.exports = {
	filename: "untitled",
	filetype: "mdma",
	input: "",
	settings: {
      general: {
        occupiedCharacters: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#=:",
        fontsize: 18,
        alignTextCenter: false
      },
      tram: {
        mapping: {
          A: [144,48,127],
          B: [147,32,100]
        },
        properties: {
          allowWords: false,
          commentIndicator: "#",
          mappingIndicator: "=",
          dataDelimiter: ":"
        }

      },
      acid: {
        mapping: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        properties: {
          globalBitmap: false,
          seed: 42,
          commentIndicator: "!"
        }
      }
    },
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