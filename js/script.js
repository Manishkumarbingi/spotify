document.addEventListener("DOMContentLoaded", () => {
    let current_song = new Audio();
    let songs;
    let currfolder;

    function secondsToMinutesSeconds(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return "00:00";
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    }

    async function get_songs(folder) {
        currfolder = folder;
        console.log(`Fetching songs from folder: ${folder}`);

        let response;
        try {
            response = await fetch(`https://api.github.com/repos/Manishkumarbingi/spotify/contents/${folder}`);
        } catch (error) {
            console.error("Error fetching folder data:", error);
            return;
        }

        if (!response.ok) {
            console.error("Failed to fetch folder data", response.status);
            return;
        }

        let data = await response.json();
        songs = data.filter(file => file.name.endsWith('.mp3')).map(file => file.name);

        let song_ul = document.querySelector(".song_list ul");
        if (song_ul) {
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

            Array.from(document.querySelectorAll(".song_list li")).forEach(e => {
                e.addEventListener("click", element => {
                    play_music(e.querySelector(".info").firstElementChild.innerHTML.trim());
                });
            });

            if (songs.length > 0) {
                play_music(songs[0].replace(".mp3", "").replaceAll("%20", " "), true);
            } else {
                console.error("No songs found in the folder.");
            }
        } else {
            console.error("Song list element not found.");
        }
    }

    const play_music = (track, pause = false) => {
        current_song.src = `https://raw.githubusercontent.com/Manishkumarbingi/spotify/main/${currfolder}/` + track + ".mp3";
        const playButton = document.getElementById("play");
        if (playButton) {
            if (!pause) {
                current_song.play();
                playButton.src = "img/pause.svg";
            } else {
                current_song.pause();
                playButton.src = "img/play-circle.svg";
            }
        } else {
            console.error("Play button not found.");
        }
        document.querySelector(".song_info").innerHTML = track;
        document.querySelector(".song_time").innerHTML = "00:00 / 00:00";
    }

    async function display_albums() {
        console.log("Fetching albums");

        let response;
        try {
            response = await fetch(`https://api.github.com/repos/Manishkumarbingi/spotify/contents/songs`);
        } catch (error) {
            console.error("Error fetching songs:", error);
            return;
        }

        if (!response.ok) {
            console.error("Failed to fetch songs", response.status);
            return;
        }

        let data = await response.json();
        let card_container = document.querySelector(".card_container");

        for (let index = 0; index < data.length; index++) {
            const e = data[index];
            if (e.type === 'dir') {
                let folder = e.name;
                console.log(`Fetching info for folder: ${folder}`);

                let info;
                try {
                    let infoResponse = await fetch(`https://raw.githubusercontent.com/Manishkumarbingi/spotify/main/songs/${folder}/info.json`);
                    if (infoResponse.ok) {
                        info = await infoResponse.json();
                    } else {
                        console.error(`Failed to fetch info for folder: ${folder}`, infoResponse.status);
                        continue;
                    }
                } catch (error) {
                    console.error(`Error fetching folder info for ${folder}:`, error);
                    continue;
                }

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
                        <h2>${info.title}</h2>
                        <p>${info.description}</p>
                    </div>`;
            }
        }

        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                console.log(`Loading songs for folder: ${item.currentTarget.dataset.folder}`);
                get_songs(`songs/${item.currentTarget.dataset.folder}`);
            });
        });

        const playButton = document.getElementById("play");
        if (playButton) {
            playButton.addEventListener("click", () => {
                if (current_song.paused) {
                    current_song.play();
                    playButton.src = "img/pause.svg";
                } else {
                    current_song.pause();
                    playButton.src = "img/play-circle.svg";
                }
            });
        } else {
            console.error("Play button not found.");
        }

        const previousButton = document.getElementById("previous");
        if (previousButton) {
            previousButton.addEventListener("click", () => {
                let index = songs.indexOf(current_song.src.split("/").slice(-1)[0]);
                if ((index - 1) >= 0) {
                    play_music(songs[index - 1].replace(".mp3", "").replaceAll("%20", " "));
                }
            });
        } else {
            console.error("Previous button not found.");
        }

        const nextButton = document.getElementById("next");
        if (nextButton) {
            nextButton.addEventListener("click", () => {
                let index = songs.indexOf(current_song.src.split("/").slice(-1)[0]);
                if ((index + 1) < songs.length) {
                    play_music(songs[index + 1].replace(".mp3", "").replaceAll("%20", " "));
                }
            });
        } else {
            console.error("Next button not found.");
        }

        const seekBar = document.querySelector(".seek_bar");
        if (seekBar) {
            seekBar.addEventListener("click", e => {
                let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
                document.querySelector(".circle").style.left = percent + "%";
                current_song.currentTime = ((current_song.duration) * percent) / 100;
            });
        } else {
            console.error("Seek bar not found.");
        }
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

        const hamburger = document.querySelector(".hamburger");
        if (hamburger) {
            hamburger.addEventListener("click", () => {
                document.querySelector(".left").style.left = "0";
            });
        } else {
            console.error("Hamburger menu button not found.");
        }

        const closeButton = document.querySelector(".close");
        if (closeButton) {
            closeButton.addEventListener("click", () => {
                document.querySelector(".left").style.left = "-120%";
            });
        } else {
            console.error("Close button not found.");
        }
    }

    main();
});
