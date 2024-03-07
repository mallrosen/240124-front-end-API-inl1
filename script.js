const allPlayersTBody = document.querySelector("#allPlayers tbody")
const searchPlayer = document.getElementById("searchPlayer")
const btnAdd = document.getElementById("btnAdd")
const closeDialog = document.getElementById("closeDialog")
const pager = document.getElementById('pager')

const allSortLinks = document.getElementsByClassName('bi') 

let currentSortCol = ""
let currentSortOrder = "" 
let currentQ = ""
let currentPageNo = 1;
let currentPageSize = 5;
let currentTotal = 0
let offset = 0


Object.values(allSortLinks).forEach(link=>{
    link.addEventListener("click",async()=>{
        currentSortCol = link.dataset.sortcol
        currentSortOrder = link.dataset.sortorder
        players = await fetchPlayers()
        updateTable()
    })
    
})


function debounce(cb, delay = 250) {
    let timeout
  
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        cb(...args)
      }, delay)
    }
  }

  const updateQuery = debounce((query) => {
    currentQ = query
    updateTable()
  }, 1000)



searchPlayer.addEventListener("input",(e)=>{
    updateQuery(e.target.value)
})

// searchPlayer.addEventListener("input", async ()=>{
//     currentQ = searchPlayer.value
//     players = await fetchPlayers()
//     updateTable()
// })



function Player(id, name,jersey,team, position){
    this.id = id
    this.name = name
    this.jersey = jersey
    this.team = team
    this.position = position
    this.visible = true
    this.matches = function(searchFor){
        return  this.name.toLowerCase().includes(searchFor) || 
                this.position.toLowerCase().includes(searchFor) || 
                this.team.toLowerCase().includes(searchFor)        
    }
}


async function fetchPlayers(){
    const result = await((await fetch("http://localhost:3000/players?sortByName=" 
    + currentSortCol + "&sortOrder=" + currentSortOrder +"&q=" + currentQ + "&limit=" + currentPageSize + "&offset=" + offset)).json())
    currentTotal = result.totalNr
    console.log(currentTotal);
    return result.result

}

let players =  await fetchPlayers()
console.log(players);

// searchPlayer.addEventListener("input", function() {
//     const searchFor = searchPlayer.value.toLowerCase() 
//     for(let i = 0; i < players.length;i++){ // TODO add a matches function
//         if(players[i].matches(searchFor)){
//             players[i].visible = true                            
//         }else{
//             players[i].visible = false 
//         }
//     }
//     updateTable()

// });

function createPager(){
    pager.innerHTML = ""
    let totalPages = Math.ceil(currentTotal / currentPageSize)
    for(let i = 1; i <= totalPages; i++){
        const li = document.createElement('li')
        li.classList.add("page-item")
        if(i == currentPageNo){
            li.classList.add("active")
        }
        const a = document.createElement('a')
        a.href="#"
        a.innerText = i
        a.classList.add("page-link")
        li.appendChild(a)
        a.addEventListener("click", async ()=>{
            
            currentPageNo = i
            offset = (currentPageNo -1)* currentPageSize
            players = await fetchPlayers()
            updateTable()
        })
        pager.appendChild(li)
    }
}

const createTableTdOrTh = function(elementType,innerText){
    let element = document.createElement(elementType)
    element.textContent = innerText
    return element
}


const playerName = document.getElementById("playerName")
const jersey = document.getElementById("jersey")
const team = document.getElementById("team")
const position = document.getElementById("position")

let editingPlayer = null

const onClickPlayer = function(event){
    const htmlElementetSomViHarKlickatPa = event.target
    console.log(htmlElementetSomViHarKlickatPa.dataset.stefansplayerid)
    const player = players.find(p=> p.id == htmlElementetSomViHarKlickatPa.dataset.stefansplayerid)
    playerName.value = player.name
    jersey.value = player.jersey
    position.value = player.position
    editingPlayer = player

    MicroModal.show('modal-1');

}

//Validering

const playerNameError = document.getElementById('playerNameError')
const playerJerseyError = document.getElementById('playerJerseyError')
const playerTeamError = document.getElementById('playerTeamError')
const playerPositionError = document.getElementById('playerPositionError')


playerName.addEventListener("input", () => {
    if (validator.isEmpty(playerName.value)) {
      playerNameError.style.display = "block";
    } else {
      playerNameError.style.display = "none";
    }
  });

  jersey.addEventListener("input", () => {
    if (validator.isEmpty(jersey.value)) {
      playerJerseyError.style.display = "block";
    } else {
      playerJerseyError.style.display = "none";
    }
  });
  

  team.addEventListener("input", () => {
    if (validator.isEmpty(team.value)) {
      playerTeamError.style.display = "block";
    } else {
      playerTeamError.style.display = "none";
    }
  });



closeDialog.addEventListener("click",async (ev)=>{
    ev.preventDefault()
    let url = ""
    let method = ""
    console.log(url)
    let changePlayer = {
        "name" : playerName.value,
        "jersey" : jersey.value,
        "team" : team.value,
        "position": position.value
        }

    if(editingPlayer != null){
        changePlayer.id = editingPlayer.id;
        url =  "http://localhost:3000/players/" + changePlayer.id
        method = "PUT"
    }else{
        url =  "http://localhost:3000/players"
        method = "POST"
    }
    //TOG BORT (KANSKE BEHÖVS SEN)
    // let response = 
    
    await fetch(url,{
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: method,
          body: JSON.stringify(changePlayer)                
    })

    //TOG BORT FÖR ATT FÅ SAVE_BTN ATT FUNGERA (KANSKE BEHÖVS SEN)
    // let json = await response.json()

    players = await fetchPlayers()
    updateTable()
    MicroModal.close('modal-1');
})

btnAdd.addEventListener("click",()=>{
    playerName.value = ""
    jersey.value = 0
    position.value = "Forward"
    editingPlayer = null

    MicroModal.show('modal-1');
    
})


const updateTable = async function(){
    players = await fetchPlayers()
    // while(allPlayersTBody.firstChild)
    //     allPlayersTBody.firstChild.remove()
    allPlayersTBody.innerHTML = ""
    createPager()
    // först ta bort alla children
    for(let i = 0; i < players.length;i++) { // hrmmm you do foreach if you'd like, much nicer! 
        if(players[i].visible == false){
            continue
        }
        let tr = document.createElement("tr")

        tr.appendChild(createTableTdOrTh("th", players[i].name))
        tr.appendChild(createTableTdOrTh("td", players[i].jersey ))
        tr.appendChild(createTableTdOrTh("td", players[i].position ))
        tr.appendChild(createTableTdOrTh("td", players[i].team ))

        let td = document.createElement("td")
        let btn = document.createElement("button")
        btn.textContent = "EDIT"
        btn.dataset.stefansplayerid=players[i].id
        td.appendChild(btn)
        tr.appendChild(td)


        btn.addEventListener("click",onClickPlayer);

        // btn.addEventListener("click",function(){
        //       alert(players[i].name)  
        //       //                      detta funkar fast med sk closures = magi vg
        // })


        allPlayersTBody.appendChild(tr)

    }

    // innerHTML och backticks `
    // Problem - aldrig bra att bygga strängar som innehåller/kan innehålla html
    //    injection
    // for(let i = 0; i < players.length;i++) { // hrmmm you do foreach if you'd like, much nicer! 
    //                                         // I will show you in two weeks
    //                                         //  or for p of players     
    //     let trText = `<tr><th scope="row">${players[i].name}</th><td>${players[i].jersey}</td><td>${players[i].position}</td><td>${players[i].team}</td></tr>`
    //     allPlayersTBody.innerHTML += trText
    // }
    // createElement
}




updateTable()





MicroModal.init({
    onShow: modal => console.info(`${modal.id} is shown`), // [1]
    onClose: modal => console.info(`${modal.id} is hidden`), // [2]
   
    openTrigger: 'data-custom-open', // [3]
    closeTrigger: 'data-custom-close', // [4]
    openClass: 'is-open', // [5]
    disableScroll: true, // [6]
    disableFocus: false, // [7]
    awaitOpenAnimation: false, // [8]
    awaitCloseAnimation: false, // [9]
    debugMode: true // [10]
  });




  
