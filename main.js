    const $ = document.querySelector.bind(document)
    const $$ = document.querySelectorAll.bind(document)

    const PLAYER_STORAGE_KEY = 'F8_PLAYER'


    const heading = $('header h2')
    const cdThumb = $('.cd-thumb')
    const audio = $('#audio')
    const cd = $('.cd');
    const playlist =   $('.playlist')
    const player = $('.player')
    const playBtn = $('.btn-toggle-play')
    const progress = $('#progress')
    const nextBtn = $('.btn-next')
    const prevBtn = $('.btn-prev')
    const randomBtn = $('.btn-random')
    const repeatBtn = $('.btn-repeat')

const app = {
    currentIndex: 0,
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY))  || {} ,
    setConfig : function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs : [
        {
            name: 'Em của ngày hôm qua',
            singer : 'Sơn Tùng Mtp',
            path : './assets/music/emcuangayhomqua.mp3',
            image: './assets/img/ecnhq.png'
        },
        {
            name: 'Âm thầm bên em',
            singer : 'Sơn Tùng Mtp',
            path : './assets/music/amthambenem.mp3',
            image: './assets/img/atbe.png'
        },
        {
            name: 'Chạy ngay đi',
            singer : 'Sơn Tùng Mtp',
            path : './assets/music/chayngaydi.mp3',
            image: './assets/img/cnd.png'
        },
        {
            name: 'Lạc trôi',
            singer : 'Sơn Tùng Mtp',
            path : './assets/music/lactroi.mp3',
            image: './assets/img/lt.png'
        },
        {
            name: 'Hãy trao cho anh',
            singer : 'Sơn Tùng Mtp',
            path : './assets/music/haytraochoanh.mp3',
            image: './assets/img/htca.png'
        },
        {
            name: 'Nơi này có anh',
            singer : 'Sơn Tùng Mtp',
            path : './assets/music/noinaycoanh.mp3',
            image: './assets/img/nnca.png'
        }
        ],
        render : function(){
            const htmls = this.songs.map( (song, index) => {
               
                return `
                <div  class="song ${index === this.currentIndex ? 'active' : ''}" data-index =" ${index} ">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>  
                `
         
            })
           
          playlist.innerHTML = htmls.join('');
        },
        defineProperties : function() {
            Object.defineProperty(this, 'currentSong', {
                get: function() {
                    return this.songs[this.currentIndex]
                }
            })
        },
        handleEvents : function() {
            const _this = this
            const cdWidth = cd.offsetWidth

            //Xử lý quay cd
            const cdThumbAnimate = cdThumb.animate([
                {
                    transform : 'rotate(360deg)'
                }
            ],{
                duration: 10000, //10 s
                interations:  Infinity
            })
            cdThumbAnimate.pause()

            // Xử lý phóng to thu nhỏ
            document.onscroll = function() {
               const scroll  = window.scrollY || document.documentElement.scrollTop
               const newWidth =  cdWidth - scroll
               cd.style.width = newWidth > 0 ? newWidth + 'px'  : 0 
               cd.style.opacity = newWidth / cdWidth
            }

            // xử lý play
            playBtn.onclick = function(){
                if (_this.isPlaying) {  
                    audio.pause()
                } else {
                    audio.play()
                }
               
            }

            // khi song playing
            audio.onplay = function(){
                _this.isPlaying = true
                player.classList.add('playing')
                cdThumbAnimate.play()
            }
            // khi song pause 
            audio.onpause = function(){
                _this.isPlaying = false
                player.classList.remove('playing')
                cdThumbAnimate.pause()
            }

            //khi tiến độ bài hát thay đổ
             audio.ontimeupdate = function() {
                if (audio.duration) {
                    const progressPercent =  Math.floor(audio.currentTime / audio.duration * 100)
                    progress.value = progressPercent
                }
             }

             // Xử lý tua nhạc 
             progress.onchange = function(e) {
                const seekTime =audio.duration / 100 * e.target.value
                audio.currentTime =   seekTime
             }

             // next song
             nextBtn.onclick = function() {
                if (_this.isRandom){
                    _this.playRandomSong()
                } else {
                    _this.nextSong()
                }
               
                audio.play()
                _this.render()
                _this.scrollToActiveSong()
                
             }
             // prev song
             prevBtn.onclick = function() {
                if (_this.isRandom){
                    _this.playRandomSong()
                } else {
                    _this.prevSong()
                }
                audio.play()
                _this.render()
                _this.scrollToActiveSong()


             }

             // random song
             randomBtn.onclick = function(e) {
                _this.isRandom = !_this.isRandom
                _this.setConfig('isRandom', _this.isRandom)
                randomBtn.classList.toggle('active', _this.isRandom)
                
             }

             // Xử lý next song khi audio end
             audio.onended = function() {
               nextBtn.click()
             }

             // repeat song
             repeatBtn.onclick = function() {
                _this.isRepeat = !_this.isRepeat
                _this.setConfig('isRepeat', _this.isRepeat)
           
                repeatBtn.classList.toggle('active', _this.isRepeat)

                // xử lý
                if (_this.isRepeat) {
                    audio.loop = true
                } else {
                    audio.loop = false
                }
             }

             // click vào playlist
             playlist.onclick = function(e) {
                const songNode = e.target.closest('.song:not(.active)')
                if (songNode  || e.target.closest('.option')) {
                    // click song
                    if (songNode ) {
                       _this.currentIndex = Number(songNode.dataset.index)
                       _this.loadCurrentSong()
                       _this.render()
                       audio.play()
                      
                    }
                    // click option
                    if (e.target.closest('.option')) {

                    }
                }
             }

        },

        scrollToActiveSong : function() {
            setTimeout(()=>{
                $('.song.active').scrollIntoView({
                    behavior:'smooth',
                    block: 'center'
                })
            })
        },

        loadCurrentSong : function() {
          
             heading.textContent = this.currentSong.name
             cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
             audio.src = this.currentSong.path

        },
        loadConfig : function() {
            this.isRandom = this.config.isRandom
            this.isRepeat = this.config.isRepeat
        },
        nextSong : function() {
            this.currentIndex++
            if (this.currentIndex >= this.songs.length ) {
                this.currentIndex = 0
            }
            this.loadCurrentSong()
        },
        prevSong : function() {
            this.currentIndex--
            if (this.currentIndex < 0 ) {
                this.currentIndex = this.songs.length -1
            }
            this.loadCurrentSong()
        },
        playRandomSong : function() {
            let newIndex
            do {
                newIndex = Math.floor(Math.random() * this.songs.length)
            } while  (newIndex === this.currentIndex)

            this.currentIndex = newIndex
            this.loadCurrentSong()
        },





    start: function() {
        // Cấu ghình
        this.loadConfig();
        // Định nghĩa các thuộc tính cho objects
        this.defineProperties ();
        
        // Lắng nghe và xử lý các sự kiện
        this.handleEvents();

        // Load current song
        this.loadCurrentSong();



        // Render playlists
        this.render()
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }

}


app.start();


