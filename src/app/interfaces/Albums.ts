export interface AlbumInterface {
  albumInfo: Record<string, unknown>
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