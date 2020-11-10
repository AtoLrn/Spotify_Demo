import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlbumInterface, Track } from './../interfaces/Albums'
import { Howl } from 'howler'
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { getAlbumApi, getBearerToken, getSavedAlbums, getRefreshedToken, getTrackInfo } from './spotify-api';
import { Tokens } from '../interfaces/Tokens';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css']
})

export class AlbumsComponent implements OnInit {
  @ViewChild('modal') modal: ElementRef;
  sound: Howl;
  albums: AlbumInterface[] = []
  actualTitleSrc = ''
  actualTitle = ''
  code: string
  bearer: string
  refresh: string
  currentAlbum: Record<string, unknown>[]
  musicList: Track[] = []
  routeSub: Subscription;

  searchAlbum = async (albumName: string): Promise<void> => {
    const albums = await getAlbumApi(albumName, this.bearer)
    this.albums = albums
  }

  queueTrack = async (trackId: number): Promise<void> => {
    if (this.bearer) {
      const tracksInfo = await getTrackInfo(this.bearer, trackId)
  
      if(tracksInfo.preview_url) {
        // Sometimes preview_url is not available so we check if
        if (!this.sound) {
          this.actualTitle = tracksInfo.name
          this.actualTitleSrc = tracksInfo.album.images[0].url
          this.createHowl(tracksInfo.preview_url)  
        } else {
          // Animation to show the user that he added the song to the queue
          this.modal.nativeElement.classList.add('show')
          this.modal.nativeElement.classList.remove('hide')
          setTimeout(() => {
            this.modal.nativeElement.classList.add('hide')
            this.modal.nativeElement.classList.remove('show')
          }, 2000);
          // Add track to queue
          this.musicList.push(tracksInfo)
        }
      }
    }
  }
  
  play = (): void => {
    // Switch howler status
    if (this.sound?.playing()){
      this.sound?.pause()
    } else {
      this.sound?.play()
    }
  }

  next = (): void => {
    // Call the next track
    this.change_track()
  }

  change_track = (): void => {
    const music = this.musicList.shift(); // Receive the next song
    if (this.sound && music) {
      // If howler and the music is available, unload the playing song and play the next
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

  getCurrentAlbums = async ():Promise<void> => {
    // If we have bearer and refresh we can get the saved Albums
    if (this.bearer !== 'undefined' && this.refresh !== 'undefined') {
      const currentAlbum = await getSavedAlbums(this.bearer)
      if (currentAlbum) {
        this.currentAlbum = currentAlbum
      } else {
        // If we don't have current albums, get a new tokens and try to get saved albums
        this.updateTokenInformation({bearer: await getRefreshedToken(this.refresh)})
        this.getCurrentAlbums()
        
      }
    }
  
  }

  updateTokenInformation = (tokens: Tokens): void => {
    if (tokens.reset) {
      localStorage.setItem('refresh', undefined)
      localStorage.setItem('bearer', undefined)
    }
    if (tokens.refresh) {
      this.refresh = tokens.refresh
      localStorage.setItem('refresh', tokens.refresh)
    } 
    if (tokens.bearer) {
      this.bearer = tokens.bearer
      localStorage.setItem('bearer', tokens.bearer)
    }
  }

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.bearer = localStorage.getItem('bearer')
    this.refresh = localStorage.getItem('refresh')
    
      this.routeSub = this.route.queryParams.subscribe(async params => {
        
        if (params.code ) {
          if (this.bearer === 'undefined' || this.refresh  === 'undefined') {
            const code = params.code
            const {bearer, refresh} = await getBearerToken(code)
            this.updateTokenInformation({bearer, refresh, reset: true})
          }
        this.getCurrentAlbums()
          
        } else if (params.bearer){
          this.updateTokenInformation({bearer: params.bearer, refresh: null, reset: true})
        } else {
          alert('no token provided')
        }
      })
  }

  ngOnDestroy= (): void => {
    this.routeSub?.unsubscribe();
    this.sound?.unload();
  }
}
