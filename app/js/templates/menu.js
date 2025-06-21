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
          {label: "Forwards",acc: "CMD+Shift+Right"},
          {label: "Backwards", acc: "CMD+Shift+Left"}
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