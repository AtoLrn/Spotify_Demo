export interface AlbumInterface {
  albumInfo: Object
  tracks: Track[]
  images?: Images[]
}

export interface Track {
  preview_url: string
  name: string
  album: AlbumInterface
}

export interface Images {
  url: string
}