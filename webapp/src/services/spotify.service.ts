import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SpotifyService {
    private readonly TOKEN_KEY = 'spotify_token';
    public async getUser() {
        return await (await fetch('https://api.spotify.com/v1/me', {
            headers: this.getDefaultHeaders()
        })).json()
    }
    public async getPlaylists() {
        return await (await fetch('https://api.spotify.com/v1/me/playlists', {
            headers: this.getDefaultHeaders()
        })).json() as {
            items: ISpotifyPlaylist[]
        }
    }
    public async getPlaylistTracks(playlistId: string) {
        return await (await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: this.getDefaultHeaders()
        })).json() as {
            items: ISpotifyTrack[]
        }
    }
    public async getTrackAnalysis(trackId: string) {
        return await (await fetch(`https://api.spotify.com/v1/audio-analysis/${trackId}`, {
            headers: this.getDefaultHeaders()
        })).json() as ISpotifyTrackAnalysis;
    }
    public async setTrack(trackId: string, deviceId: string) {
        return await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'put',
            headers: this.getDefaultHeaders(),
            body: JSON.stringify({
                uris: [`spotify:track:${trackId}`]
            })
        })
    }
    public isLoggedIn() {
        return Boolean(this.getToken());
    }
    public setToken(accessToken: string) {
        return localStorage.setItem(this.TOKEN_KEY, accessToken);
    }
    public getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }
    public async setPlaybackDevice(deviceId: string) {
        return await fetch("https://api.spotify.com/v1/me/player", {
            method: "put",
            headers: this.getDefaultHeaders(),
            body: JSON.stringify({ device_ids: [deviceId], play: false }),
        })
    }
    private getDefaultHeaders() {
        return {
            authorization: `Bearer ${this.getToken()}`
        }
    }
}

export interface ISpotifyTrackAnalysis {
    beats: Array<{ start: number; duration: number; confidence: number; }>;
}

export interface ISpotifyTrack {
    "added_at": "2021-08-14T14:35:49Z",
    "added_by": {
        "external_urls": {
            "spotify": "https://open.spotify.com/user/11134339144"
        },
        "href": "https://api.spotify.com/v1/users/11134339144",
        "id": "11134339144",
        "type": "user",
        "uri": "spotify:user:11134339144"
    },
    "is_local": false,
    "primary_color": null,
    "track": {
        "album": {
            "album_type": "single",
            "artists": [{
                "external_urls": {
                    "spotify": "https://open.spotify.com/artist/1MF873qFvGywvDUQbldyMH"
                },
                "href": "https://api.spotify.com/v1/artists/1MF873qFvGywvDUQbldyMH",
                "id": "1MF873qFvGywvDUQbldyMH",
                "name": "Zaini",
                "type": "artist",
                "uri": "spotify:artist:1MF873qFvGywvDUQbldyMH"
            }, {
                "external_urls": {
                    "spotify": "https://open.spotify.com/artist/57A8a9CoP4Bu1NZNvx0eeJ"
                },
                "href": "https://api.spotify.com/v1/artists/57A8a9CoP4Bu1NZNvx0eeJ",
                "id": "57A8a9CoP4Bu1NZNvx0eeJ",
                "name": "vict molina",
                "type": "artist",
                "uri": "spotify:artist:57A8a9CoP4Bu1NZNvx0eeJ"
            }],
            "available_markets": ["AD", "AE", "AG", "AL", "AM", "AO", "AR", "AT", "AU", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BN", "BO", "BR", "BS", "BT", "BW", "BY", "BZ", "CA", "CH", "CI", "CL", "CM", "CO", "CR", "CV", "CW", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "ES", "FI", "FJ", "FM", "FR", "GA", "GB", "GD", "GE", "GH", "GM", "GN", "GQ", "GR", "GT", "GW", "GY", "HK", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IN", "IS", "IT", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KR", "KW", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "MA", "MC", "MD", "ME", "MG", "MH", "MK", "ML", "MN", "MO", "MR", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NE", "NG", "NI", "NL", "NO", "NP", "NR", "NZ", "OM", "PA", "PE", "PG", "PH", "PK", "PL", "PS", "PT", "PW", "PY", "QA", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SE", "SG", "SI", "SK", "SL", "SM", "SN", "SR", "ST", "SV", "SZ", "TD", "TG", "TH", "TL", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "US", "UY", "UZ", "VC", "VN", "VU", "WS", "XK", "ZA", "ZM", "ZW"],
            "external_urls": {
                "spotify": "https://open.spotify.com/album/18wlQBtWMIidnlL0BI7Axq"
            },
            "href": "https://api.spotify.com/v1/albums/18wlQBtWMIidnlL0BI7Axq",
            "id": "18wlQBtWMIidnlL0BI7Axq",
            "images": [{
                "height": 640,
                "url": "https://i.scdn.co/image/ab67616d0000b273fe3006f3fcdbddf0f4af59a1",
                "width": 640
            }, {
                "height": 300,
                "url": "https://i.scdn.co/image/ab67616d00001e02fe3006f3fcdbddf0f4af59a1",
                "width": 300
            }, {
                "height": 64,
                "url": "https://i.scdn.co/image/ab67616d00004851fe3006f3fcdbddf0f4af59a1",
                "width": 64
            }],
            "name": "it's ok to leave",
            "release_date": "2021-08-06",
            "release_date_precision": "day",
            "total_tracks": 1,
            "type": "album",
            "uri": "spotify:album:18wlQBtWMIidnlL0BI7Axq"
        },
        "artists": [{
            "external_urls": {
                "spotify": "https://open.spotify.com/artist/1MF873qFvGywvDUQbldyMH"
            },
            "href": "https://api.spotify.com/v1/artists/1MF873qFvGywvDUQbldyMH",
            "id": "1MF873qFvGywvDUQbldyMH",
            "name": "Zaini",
            "type": "artist",
            "uri": "spotify:artist:1MF873qFvGywvDUQbldyMH"
        }, {
            "external_urls": {
                "spotify": "https://open.spotify.com/artist/57A8a9CoP4Bu1NZNvx0eeJ"
            },
            "href": "https://api.spotify.com/v1/artists/57A8a9CoP4Bu1NZNvx0eeJ",
            "id": "57A8a9CoP4Bu1NZNvx0eeJ",
            "name": "vict molina",
            "type": "artist",
            "uri": "spotify:artist:57A8a9CoP4Bu1NZNvx0eeJ"
        }],
        "available_markets": ["AD", "AE", "AG", "AL", "AM", "AO", "AR", "AT", "AU", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BN", "BO", "BR", "BS", "BT", "BW", "BY", "BZ", "CA", "CH", "CI", "CL", "CM", "CO", "CR", "CV", "CW", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "ES", "FI", "FJ", "FM", "FR", "GA", "GB", "GD", "GE", "GH", "GM", "GN", "GQ", "GR", "GT", "GW", "GY", "HK", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IN", "IS", "IT", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KR", "KW", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "MA", "MC", "MD", "ME", "MG", "MH", "MK", "ML", "MN", "MO", "MR", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NE", "NG", "NI", "NL", "NO", "NP", "NR", "NZ", "OM", "PA", "PE", "PG", "PH", "PK", "PL", "PS", "PT", "PW", "PY", "QA", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SE", "SG", "SI", "SK", "SL", "SM", "SN", "SR", "ST", "SV", "SZ", "TD", "TG", "TH", "TL", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "US", "UY", "UZ", "VC", "VN", "VU", "WS", "XK", "ZA", "ZM", "ZW"],
        "disc_number": 1,
        "duration_ms": 184864,
        "episode": false,
        "explicit": false,
        "external_ids": {
            "isrc": "GBKQU2176394"
        },
        "external_urls": {
            "spotify": "https://open.spotify.com/track/7qzml1MrEDlLJPAtwrCUWT"
        },
        "href": "https://api.spotify.com/v1/tracks/7qzml1MrEDlLJPAtwrCUWT",
        "id": "7qzml1MrEDlLJPAtwrCUWT",
        "is_local": false,
        "name": "it's ok to leave",
        "popularity": 34,
        "preview_url": "https://p.scdn.co/mp3-preview/0beba9a23c441d654b3b8f53649d12e0c7ee8a2e?cid=c8e390667f904c54b5ee7d8d03b19f1d",
        "track": true,
        "track_number": 1,
        "type": "track",
        "uri": "spotify:track:7qzml1MrEDlLJPAtwrCUWT"
    },
    "video_thumbnail": {
        "url": null
    }
}

export interface ISpotifyPlaylist {
    "collaborative": false,
    "description": "",
    "external_urls": {
        "spotify": "https://open.spotify.com/playlist/3imvNYosju8BSJPBw1nJrd"
    },
    "href": "https://api.spotify.com/v1/playlists/3imvNYosju8BSJPBw1nJrd",
    "id": "3imvNYosju8BSJPBw1nJrd",
    "images": [{
        "height": 640,
        "url": "https://i.scdn.co/image/ab67616d0000b273fe3006f3fcdbddf0f4af59a1",
        "width": 640
    }],
    "name": "it's ok to leave",
    "owner": {
        "display_name": "Kosmas Papadatos",
        "external_urls": {
            "spotify": "https://open.spotify.com/user/11134339144"
        },
        "href": "https://api.spotify.com/v1/users/11134339144",
        "id": "11134339144",
        "type": "user",
        "uri": "spotify:user:11134339144"
    },
    "primary_color": null,
    "public": false,
    "snapshot_id": "MyxkMTczMzQ2Njg1YTdlZWNmMjlhODI4ZjU1ZGM4YjFhNTNlNTgzYjVi",
    "tracks": {
        "href": "https://api.spotify.com/v1/playlists/3imvNYosju8BSJPBw1nJrd/tracks",
        "total": 2
    },
    "type": "playlist",
    "uri": "spotify:playlist:3imvNYosju8BSJPBw1nJrd"
}

export interface ISpotifyUser {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
        "filter_enabled": false,
        "filter_locked": false
    },
    external_urls: {
        spotify: string;
    },
    followers: {
        "href": null,
        "total": 7
    },
    href: string;
    id: string;
    images: [
        {
            "height": null,
            "url": "https://scontent-cdt1-1.xx.fbcdn.net/v/t1.18169-1/p320x320/10411784_10204487237757191_4757950121941600840_n.jpg?_nc_cat=105&ccb=1-5&_nc_sid=0c64ff&_nc_ohc=351PN7XWvo8AX8LpGtG&_nc_ht=scontent-cdt1-1.xx&edm=AP4hL3IEAAAA&oh=6fdc2b949d202d12e75aa63b7c2a0439&oe=613B532C",
            "width": null
        }
    ],
    product: "premium",
    type: "user",
    uri: string;
}