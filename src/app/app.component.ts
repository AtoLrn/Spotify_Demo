import { Component } from '@angular/core';
import { AlbumInterface } from './interfaces/Albums'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  title = 'spotify-app';

  albums: AlbumInterface[] = []
  
  async getAlbum(albumName: string) {
    const header: Headers = new Headers({
      'Authorization': 'Bearer BQBrZTk_AQINhweq2xCoZRyVbA4L75uT-4uSq9mxYsTKTFjDziZHISDDWIRg88JoEj_poa6FMh_iLETEnQs',
    })
    const req: RequestInit = {
      headers: header
    }

    fetch(`https://api.spotify.com/v1/search?q=${albumName}&type=album`, req).then(response => {
      response.json().then(value => {
        value.albums.items.forEach(album => {
          fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks`, req).then(tracksResponse => {
            tracksResponse.json().then(jsonTracks => {
              this.albums.push({ albumInfo: album, tracks: jsonTracks})
            })
            })
        
      })
    })

    })
  }
  clicked(albumId) {
    console.log('clicked', albumId)
  }
  constructor(){
  }
  
}
