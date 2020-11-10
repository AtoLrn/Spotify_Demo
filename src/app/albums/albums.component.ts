import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlbumInterface, Track } from './../interfaces/Albums'
import { Howl } from 'howler'
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css']
})

export class AlbumsComponent implements OnInit {
  @ViewChild('modal') modal: ElementRef;
  sound: Howl;
  albums: AlbumInterface[] = []
  actualTitleSrc: string = ''
  actualTitle: string = ''
  code: string
  bearer: string
  refresh: string
  currentAlbum: any
  musicList: Track[] = []
  routeSub: Subscription;


  getAlbum = (albumName: string): void => {
    

    if (this.bearer) {
      const header: Headers = new Headers({
        'Authorization': 'Bearer '+this.bearer,
      })
      const req: RequestInit = {
        headers: header
      }
  
      if (albumName) {
        fetch(`https://api.spotify.com/v1/search?q=${albumName}&type=album`, req).then(response => {
          response.json().then(value => {
            value.albums.items.forEach(album => {
              fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks`, req).then(tracksResponse => {
                this.albums = []
                tracksResponse.json().then(jsonTracks => {
                  this.albums.push({ albumInfo: album, tracks: jsonTracks})
                })
                })
            
          })
        })
    
        })
      }
    }


  }

  getBearerToken = async (code: string):Promise<void> => {
    const headers: Headers = new Headers({
      "Authorization": "Basic YTU2ZWExNTRiOTM2NDI3N2FmOWRlMDAwNDYzNDZjOWI6ODZhZjU0MjMzYTE2NGQyYzhiNTk2MDZkZDgwN2I4ZjM="
    })

    const params: URLSearchParams = new URLSearchParams({
      "grant_type": "authorization_code",
      "code": code,
      "redirect_uri": "http://localhost:4200/callback"
    })

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: headers,
      body: params,
      redirect: 'follow'
    };

    const response = await fetch("https://accounts.spotify.com/api/token", requestOptions)
    const result = await response.json()
    this.bearer = result.access_token
    this.refresh = result.refresh_token
    
    localStorage.setItem('bearer', result.access_token)
    localStorage.setItem('refresh', result.refresh_token)
  }

  clicked = (albumId: number): void => {
    //console.log('clicked', albumId)

    if (this.bearer) {
      const header: Headers = new Headers({
        'Authorization': 'Bearer '+this.bearer,
      })
  
      const req: RequestInit = {
        headers: header
      }
  
      fetch(`https://api.spotify.com/v1/tracks/${albumId}`, req).then(response => {
        response.json().then(value => {
          
  
          if(value.preview_url) {
            if (!this.sound) {
              this.actualTitle = value.name
              this.actualTitleSrc = value.album.images[0].url
              this.createHowl(value.preview_url)  
            } else {
              this.modal.nativeElement.classList.add('show')
              this.modal.nativeElement.classList.remove('hide')
              setTimeout(() => {
                this.modal.nativeElement.classList.add('hide')
                this.modal.nativeElement.classList.remove('show')
              }, 2000);
              this.musicList.push(value)
            }
            
  
           }
        })
      })
    }

  }
  
  play = (): void => {
    console.log(this.sound?._duration)
    if (this.sound?.playing()){
      this.sound?.pause()
    } else {
      this.sound?.play()
      
    }
  }

  next = (): void => {
    this.change_track()
  }

  change_track = (): void => {
    const music = this.musicList.shift(); // Receive the ongoing song
    if (this.sound && music) {
      this.actualTitle = music.name
      this.actualTitleSrc = music.album.images[0].url
      this.sound.unload()
      this.createHowl(music.preview_url)   
    }
  }

  createHowl = (trackUrl: string): void => {
    this.sound = new Howl({
      src: [trackUrl],
      html5: true,
      onend: this.change_track
      })
    this.sound.volume(0.05)
    this.sound.play()
  }

  getCurrentAlbums = ():void => {
    if(this.refresh) {
      const header: Headers = new Headers({
        'Authorization': 'Bearer '+this.bearer,
      })
  
      const req: RequestInit = {
        headers: header
      }

      fetch("https://api.spotify.com/v1/me/albums?limit=5", req).then(response => {
        response.json().then(result => {
          console.log(result)
          this.currentAlbum = result.items
        })
      })
    }
  }

  constructor(private route: ActivatedRoute) {


   }

  ngOnInit(): void {
    
    this.bearer = localStorage.getItem('bearer')
    this.refresh = localStorage.getItem('refresh')
    console.log(this.bearer)


    
      this.routeSub = this.route.queryParams.subscribe(async params => {
        
        if (params.code) {
          if (!this.refresh) {
            const code = params.code
            await this.getBearerToken(code)
            this.getCurrentAlbums()
          }
        } else if (params.bearer){
          if (!this.bearer) {
            this.bearer = params.bearer
            localStorage.setItem('bearer', params.bearer)
          }

        } else {
          alert('no token provided')
        }
      })
    
    this.getCurrentAlbums()


  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

}
