module.exports = {
  file: [],
  view: [
    [
      {label: "Zoom In",acc:"CMD+Shift+NumAdd"},
      {label: "Zoom Out",acc:"CMD+Shift+NumSub"}
    ],
    [
      {label: "Toggle UI",acc:"CMD+Shift+."},
    ]
  ],
  edit: [],
  window: [
    [
      {label: "Focus Workspace",acc:"CMD+Shift+W"},
      {label: "Switch Window",acc:"CMD+Shift+C"}
    ],
    [
      {label: "Open Viewer",acc:"CMD+Shift+V"},
      {label: "Open Editor",acc:"CMD+Shift+E"}
    ]
  ],
  extras: [
    {
      label: "Transport",
      menu: [
        [
          {label: "Play Pause",acc: "CMD+Shift+P"},
          {label: "Stop",acc: "CMD+Shift+S"}
        ],
        [
          {label: "Tempo Up",acc: "CMD+Shift+Numadd"},
          {label: "Tempo Down",acc: "CMD+Shift+Numsub"}
        ],
        [
          {label: "Jump 100ms Back",acc: "Option+Left"},
          {label: "Jump 100ms Ahead",acc: "Option+Right"},
          {label: "Jump 10ms Back",acc: "CMD+Shift+Option+Left"},
          {label: "Jump 10ms Ahead",acc: "CMD+Shift+Option+Right"},
        ]
      ]
    },
    {
      label: "IO",
      menu: [
        [
          {label: "Refresh IO",acc: "CMD+Shift+R"},
          {label: "Next Input",acc: "CMD+Shift+I"},
          {label: "Previous Input"},
          {label: "Next Output",acc: "CMD+Shift+O"},
          {label: "Previous Output"}
        ],
        [
          {label: "Toggle Clock Send"},
          {label: "Toggle Clock Recieve"},
          {label: "Toggle Clock Type"},
          {label: "Toggle Clock Source"}
        ],
        [
          {label: "Toggle Transport Send"},
          {label: "Toggle Transport Recieve"}
        ]
      ]
    }
  ]
}