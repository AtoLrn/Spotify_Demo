export const getAlbum = (albumName: string, bearer: string): void => {
    

    if (bearer) {
      const header: Headers = new Headers({
        'Authorization': 'Bearer '+bearer,
      })
      const req: RequestInit = {
        headers: header
      }
  
      if (albumName) {
        fetch(`https://api.spotify.com/v1/search?q=${albumName}&type=album`, req).then(response => {
          response.json().then(value => {
            value.albums.items.forEach(album => {
              fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks`, req).then(tracksResponse => {
                const albums = []
                tracksResponse.json().then(jsonTracks => {
                  albums.push({ albumInfo: album, tracks: jsonTracks})
                })
                return albums
                })
            
          })
        })
    
        })
      }
    }


  }