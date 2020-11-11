export interface AlbumInterface {
  albumInfo: albumInfo
  tracks: Track[]
  images?: Images[]
}

export interface albumInfo {
  images: {
      url: string
  } []
   
  artists: {
    name: string
  } []

  name: string
}

export interface Track {
  preview_url: string
  name: string
  album: AlbumInterface
}

export interface Images {
  url: string
}