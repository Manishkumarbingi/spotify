let current_song = new Audio();
let songs;
let currfolder
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const FormatedMinutes = String(minutes).padStart(2, '0');
    const FormatedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${FormatedMinutes}:${FormatedSeconds}`

}
async function get_songs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    
    let song_ul = document.querySelector(".song_list").getElementsByTagName("ul")[0]
    song_ul.innerHTML = ""
    for (const song of songs) {
        song_ul.innerHTML = song_ul.innerHTML + `<li> 
        <img class="invert music" src="img/music.svg" alt="">
        <div class="info">
            <div>${song.replace(".mp3", "").replaceAll("%20", " ")}</div>
            <div>Manish</div>
        </div>
        <div class="playnow">
            
        <img class="invert" src="img/play-circle.svg" alt="play now">
        </div>
        </li>`;
    }
    
    Array.from(document.querySelector(".song_list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            play_music(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    play_music(songs[0].replace(".mp3", "").replaceAll("%20"," "),true);
    
   
    
}
const play_music = (track, pause = false) => {
    // let audio=new Audio("/songs/"+track+".mp3")
    current_song.src = `/${currfolder}/` + track + ".mp3"
    if (!pause) {
        current_song.play()
        play.src = "img/pause.svg"
    }
    else {
        current_song.pause()
        play.src = "img/play-circle.svg"
    }
    document.querySelector(".song_info").innerHTML = track
    document.querySelector(".song_time").innerHTML = "00:00 / 00:00"
}
async function display_albums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let card_container = document.querySelector(".card_container");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            // Getting meta data of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            let coverUrl = `https://raw.githubusercontent.com/manishkumarbingi/manishkumarbingi.github.io/main/songs/${folder}/cover.jpg`;
            card_container.innerHTML += `
           <div data-folder="${folder}" class="card">
           <div class="play">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   xmlns="http://www.w3.org/2000/svg">
                   <path d="M5 20V4L19 12L5 20Z" fill="#000" stroke="#141834" stroke-width="1.5"
                       stroke-line-join="round" />
               </svg>
           </div>
           <img src="${coverUrl}" alt="">
           <h2>${response.title}</h2>
           <p>${response.discription}</p>
           </div>`;
        }
    }
}

    
    //loading playlists
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            get_songs(`songs/${item.currentTarget.dataset.folder}`)
            
        })
    })
    //atach an event listner for next and previous buttons
    play.addEventListener("click", () => {
        
        if (current_song.paused) {
            current_song.play()
            play.src = "img/pause.svg"
        }
        else {
            current_song.pause()
            play.src = "img/play-circle.svg"
        }
    })
    // event linster to previous and next buttons
    previous.addEventListener("click", async item  => {
        let index = songs.indexOf(current_song.src.split("/").slice(-1)[0])
        
        if ((index - 1) >= 0) {
            play_music(songs[index - 1].replace(".mp3", "").replaceAll("%20", " "))
        }

    })
    
    next.addEventListener("click", () => {
     
        
        let index = songs.indexOf(current_song.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            play_music(songs[index + 1].replace(".mp3", "").replaceAll("%20", " "))
        }

    })
    // eventlistener for seek Bar 

    document.querySelector(".seek_bar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        current_song.currentTime = ((current_song.duration) * percent) / 100
    })

    
    
}
async function main() {

    await get_songs("songs/ncs")
    play_music(songs[0].replace(".mp3", ""), true);

    //displaying albums
    display_albums()

    
    
    // listen for time ubdate event 
    current_song.addEventListener("timeupdate", () => {
        document.querySelector(".song_time").innerHTML = `${secondsToMinutesSeconds(current_song.currentTime)}/${secondsToMinutesSeconds(current_song.duration)}`
        document.querySelector(".circle").style.left = (current_song.currentTime / current_song.duration) * 100 + "%"
    })
    
    // event lisner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    // event lisner for closebutton
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    
    

    

}
main();
