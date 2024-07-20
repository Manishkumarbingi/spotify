let current_song = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const FormatedMinutes = String(minutes).padStart(2, '0');
    const FormatedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${FormatedMinutes}:${FormatedSeconds}`;
}

async function get_songs(folder) {
    currfolder = folder;
    console.log(`Fetching songs from folder: ${folder}`);

    let a;
    try {
        a = await fetch(`https://raw.githubusercontent.com/Manishkumarbingi/spotify/main/${folder}/`);
    } catch (error) {
        console.error("Error fetching folder data:", error);
        return;
    }

    if (!a.ok) {
        console.error("Failed to fetch folder data", a.status);
        return;
    }

    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let song_ul = document.querySelector(".song_list").getElementsByTagName("ul")[0];
    song_ul.innerHTML = "";
    for (const song of songs) {
        console.log(song); // Added for debugging
        song_ul.innerHTML += `<li> 
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
            play_music(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    if (songs.length > 0) {
        play_music(songs[0].replace(".mp3", "").replaceAll("%20", " "), true);
    } else {
        console.error("No songs found in the folder.");
    }
}

const play_music = (track, pause = false) => {
    current_song.src = `https://raw.githubusercontent.com/Manishkumarbingi/spotify/main/${currfolder}/` + track + ".mp3";
    if (!pause) {
        current_song.play();
        document.querySelector(".play").src = "img/pause.svg";
    } else {
        current_song.pause();
        document.querySelector(".play").src = "img/play-circle.svg";
    }
    document.querySelector(".song_info").innerHTML = track;
    document.querySelector(".song_time").innerHTML = "00:00 / 00:00";
}

async function display_albums() {
    console.log("Fetching albums");

    let a;
    try {
        a = await fetch(`https://raw.githubusercontent.com/Manishkumarbingi/spotify/main/songs/`);
    } catch (error) {
        console.error("Error fetching songs:", error);
        return;
    }

    if (!a.ok) {
        console.error("Failed to fetch songs", a.status);
        return;
    }

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
            console.log(`Fetching info for folder: ${folder}`);

            let a;
            try {
                a = await fetch(`https://raw.githubusercontent.com/Manishkumarbingi/spotify/main/songs/${folder}/info.json`);
            } catch (error) {
                console.error(`Error fetching folder info for ${folder}:`, error);
                continue;
            }

            if (!a.ok) {
                console.error(`Failed to fetch info for folder: ${folder}`, a.status);
                continue;
            }

            let response = await a.json();
            card_container.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" fill="#000" stroke="#141834" stroke-width="1.5"
                                stroke-line-join="round" />
                        </svg>
                    </div>
                    <img src="https://raw.githubusercontent.com/Manishkumarbingi/spotify/main/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(`Loading songs for folder: ${item.currentTarget.dataset.folder}`);
            get_songs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });

    document.querySelector(".play").addEventListener("click", () => {
        if (current_song.paused) {
            current_song.play();
            document.querySelector(".play").src = "img/pause.svg";
        } else {
            current_song.pause();
            document.querySelector(".play").src = "img/play-circle.svg";
        }
    });

    document.querySelector(".previous").addEventListener("click", async item => {
        let index = songs.indexOf(current_song.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            play_music(songs[index - 1].replace(".mp3", "").replaceAll("%20", " "));
        }
    });

    document.querySelector(".next").addEventListener("click", () => {
        let index = songs.indexOf(current_song.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            play_music(songs[index + 1].replace(".mp3", "").replaceAll("%20", " "));
        }
    });

    document.querySelector(".seek_bar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        current_song.currentTime = ((current_song.duration) * percent) / 100;
    });
}

async function main() {
    await get_songs("songs/ncs");
    if (songs.length > 0) {
        play_music(songs[0].replace(".mp3", ""), true);
    }
    display_albums();

    current_song.addEventListener("timeupdate", () => {
        document.querySelector(".song_time").innerHTML = `${secondsToMinutesSeconds(current_song.currentTime)}/${secondsToMinutesSeconds(current_song.duration)}`;
        document.querySelector(".circle").style.left = (current_song.currentTime / current_song.duration) * 100 + "%";
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
}

main();



    


