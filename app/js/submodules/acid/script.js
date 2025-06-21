import {ACIDWrapper} from './js/acidWrapper.js'

window.addEventListener('DOMContentLoaded',function(){
  const input = document.getElementById('input')
  input.addEventListener("input",function(e){
    e.preventDefault()
  })
  const seed = Math.floor(Math.random() * 1000000)
  new ACIDWrapper(input,seed)
})