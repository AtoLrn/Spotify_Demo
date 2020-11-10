import { AlbumInterface } from '../interfaces/Albums'

export const getAlbumApi = async (albumName: string, bearer: string): Promise<AlbumInterface[]> => {
    if (bearer) {
        const header: Headers = new Headers({
            'Authorization': 'Bearer '+bearer,
        })

        const req: RequestInit = {
            headers: header
        }

        if (albumName) {
            const albums = await fetch(`https://api.spotify.com/v1/search?q=${albumName}&type=album`, req)
            const albumsResult = await albums.json()
            const returnedAlbums = []
            albumsResult.albums.items.forEach(async (album) => {
                const tracks = await fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks`, req)
                const tracksJson = await tracks.json()
                returnedAlbums.push({ albumInfo: album, tracks: tracksJson})
            })
            return returnedAlbums
        }
    }
}

export const getRefreshedToken = async (refreshToken: string):Promise<string | null> => {
    console.log('AAAAA2', refreshToken)
    if (refreshToken) {
    
      const header: Headers = new Headers({
        "Authorization": "Basic YTU2ZWExNTRiOTM2NDI3N2FmOWRlMDAwNDYzNDZjOWI6ODZhZjU0MjMzYTE2NGQyYzhiNTk2MDZkZDgwN2I4ZjM="
      })
      const params: URLSearchParams = new URLSearchParams({
        "grant_type": "refresh_token",
        "refresh_token": refreshToken
      })

      const requestOptions: RequestInit = {
        method: 'POST',
        headers: header,
        body: params,
        redirect: 'follow'
      };

      const response = await fetch("https://accounts.spotify.com/api/token", requestOptions)
      const result = await response.json()
      console.log('AAAAA', result.access_token)
      
      return result.access_token
    } else {
      console.error('No Refresh Token find')
      return null
    }
  }

export const getSavedAlbums = async (bearerToken: string): Promise<Record<string, unknown>[] | null> => {
        const header: Headers = new Headers({
          'Authorization': 'Bearer '+bearerToken,
        })

        const req: RequestInit = {
          headers: header
        }

        const response = await fetch("https://api.spotify.com/v1/me/albums?limit=5", req)
        const result = await response.json()
        if (result.error) {
            console.log(result.error.message)
            return null
        } else {
            return result.items
        }
  }

export const  getBearerToken = async (code: string): Promise<any> => {
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

    return { bearer: result.access_token, refresh: result.refresh_token }
}

export const getTrackInfo = async (bearer, trackId): Promise<any> => {
    const header: Headers = new Headers({
        'Authorization': 'Bearer '+bearer,
    })
  
    const req: RequestInit = {
        headers: header
    }

    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, req)
    const result = await response.json()
    return result
}   