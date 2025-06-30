export class MenuWrapper{
	#CONTAINER
	#SECTIONS = {
		selected: false,
		containers: {},
		buttons: {}
	}
	constructor(container){
		this.#CONTAINER = container
		this.#connect()
	}

	#connect(){
		let sectionsMenu = [].slice.call(this.#CONTAINER.getElementsByClassName("sections"))[0]
		let sections = [].slice.call(this.#CONTAINER.getElementsByClassName("section"))
		let sectionsSelectors = [].slice.call(sectionsMenu.getElementsByTagName("li"))
		for(let s of sections){
			let sectionName = s.getAttribute("data-section")
			this.#SECTIONS.containers[sectionName] = s
		}
		for(let s of sectionsSelectors){
			let sectionName = s.innerText.toLowerCase()
			s.addEventListener("click",function(){this.selectSection(sectionName)}.bind(this,sectionName))
			this.#SECTIONS.buttons[sectionName] = s
		}
		this.selectSection(sectionsSelectors[0].innerText.toLowerCase())
	}
	selectSection(s){
		if(this.#SECTIONS.selected){
			this.#setSectionClass(this.#SECTIONS.selected,false)
		}
		this.#SECTIONS.selected = s
		this.#setSectionClass(this.#SECTIONS.selected,true)
	}
	#setSectionClass(section,state){
		if(state){
			this.#SECTIONS.containers[section].classList.add("active")
			this.#SECTIONS.buttons[section].classList.add("active")
		}
		else{
			this.#SECTIONS.containers[section].classList.remove("active")
			this.#SECTIONS.buttons[section].classList.remove("active")
		}
		
	}
}