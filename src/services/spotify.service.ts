import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SpotifyService {
    private readonly accessTokenKey = 'spotify_access_token';
    private readonly refreshTokenKey = 'spotify_refresh_token';
    private readonly codeVerifierKey = 'code_verifier';
    private readonly clientId = 'c8e390667f904c54b5ee7d8d03b19f1d';
    private readonly apiServiceUrl = 'https://api.spotify.com';
    private readonly authServiceUrl = 'https://accounts.spotify.com';
    constructor(private router: Router) { }
    public async getUser() {
        return await this.request('/v1/me', {
            headers: this.getDefaultHeaders()
        }) as ISpotifyUser;
    }
    public async getPlaylists() {
        return await this.request('/v1/me/playlists', {
            headers: this.getDefaultHeaders()
        }) as {
            items: ISpotifyPlaylist[]
        };
    }
    public async getPlaylistTracks(playlistId: string) {
        return await this.request(`/v1/playlists/${playlistId}/tracks`, {
            headers: this.getDefaultHeaders()
        }) as {
            items: ISpotifyTrack[]
        };
    }
    public async getTrackAnalysis(trackId: string) {
        return await this.request(`/v1/audio-analysis/${trackId}`) as ISpotifyTrackAnalysis;
    }
    public async setTrack(trackId: string, deviceId: string) {
        return await this.request(`/v1/me/player/play?device_id=${deviceId}`, {
            method: 'put',
            body: JSON.stringify({
                uris: [`spotify:track:${trackId}`]
            })
        });
    }
    public isLoggedIn() {
        return Boolean(this.getRefreshToken());
    }
    public setSessionTokens(tokens: { accessToken: string; refreshToken: string; }) {
        localStorage.setItem(this.accessTokenKey, tokens.accessToken);
        localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
    }
    public clearSessionTokens() {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }
    public getAccessToken() {
        return localStorage.getItem(this.accessTokenKey);
    }
    public async setPlaybackDevice(deviceId: string) {
        return await this.request('/v1/me/player', {
            method: 'put',
            body: JSON.stringify({ device_ids: [deviceId], play: false }),
        });
    }
    public async loginWithCode(code: string) {
        const form = new URLSearchParams();

        form.append('client_id', this.clientId);
        form.append('grant_type', 'authorization_code');
        form.append('code', code);
        form.append('redirect_uri', this.getRedirectUri());
        form.append('code_verifier', this.getCodeVerifier());

        const response = await fetch(`${this.authServiceUrl}/api/token`, {
            method: 'post',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form
        });

        const tokens = await response.json() as { access_token: string; refresh_token: string; };

        this.setSessionTokens({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token
        });
    }
    private async request<T = any>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
        const response = await fetch(`${this.apiServiceUrl}${path}`, {
            method: 'get',
            ...options,
            headers: {
                ...this.getDefaultHeaders(),
                ...options.headers
            }
        });

        if (response.status === 401) {
            if (isRetry) {
                this.goToLogin();
            } else {
                await this.refreshTokens();
                return await this.request(path, options, true);
            }
        }

        try {
            return await response.json();
        } catch {
            return null as any;
        }
    }
    private getDefaultHeaders() {
        return {
            authorization: `Bearer ${this.getAccessToken()}`
        };
    }
    private async refreshTokens() {
        const form = new URLSearchParams();

        form.append('client_id', this.clientId);
        form.append('grant_type', 'refresh_token');
        form.append('refresh_token', this.getRefreshToken());

        const response = await fetch(`${this.authServiceUrl}/api/token`, {
            method: 'post',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form
        });

        if (response.status === 200) {
            const tokens = await response.json() as { access_token: string; refresh_token: string; };

            this.setSessionTokens({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token
            });
        } else {
            this.goToLogin();
        }
    }
    private goToLogin() {
        this.router.navigate(['login']);
    }
    private getRefreshToken() {
        return localStorage.getItem(this.refreshTokenKey) as string;
    }
    public async getSpotifyOAuthUrl() {
        return `${this.authServiceUrl}/authorize?${[
            `client_id=${this.clientId}`,
            `response_type=code`,
            `redirect_uri=${encodeURIComponent(this.getRedirectUri())}`,
            `scope=streaming+user-read-email+user-modify-playback-state+user-read-private+playlist-read-private`,
            `show_dialog=true`,
            `code_challenge_method=S256`,
            `code_challenge=${await this.getCodeCallenge()}`,
        ].join('&')
            }`;
    }
    private getRedirectUri() {
        return `${location.origin}/login`;
    }
    private async getCodeCallenge() {
        const code = this.getCodeVerifier();
        const hash = Array.from(
            new Uint8Array(
                await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code))
            )
        ).map(b => String.fromCharCode(b)).join('');

        return btoa(hash).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    private getCodeVerifier(): string {
        let code = localStorage.getItem(this.codeVerifierKey);

        if (!code) {
            this.generateCodeVerifier();
            code = this.getCodeVerifier();
        }

        return code as string;
    }
    private generateCodeVerifier() {
        localStorage.setItem(this.codeVerifierKey, Math.random().toString().repeat(4).replace(/\./g, '0'));
    }
}

export interface ISpotifyTrackAnalysis {
    beats: Array<{
        start: number;
        duration: number;
        confidence: number;
    }>;
    segments: Array<{
        duration: number;
        loudness_max: number;
        loudness_max_time: number;
        loudness_start: number;
        start: number;
    }>;
}

export interface ISpotifyTrack {
    'added_at': '2021-08-14T14:35:49Z';
    'added_by': {
        'external_urls': {
            'spotify': 'https://open.spotify.com/user/11134339144'
        },
        'href': 'https://api.spotify.com/v1/users/11134339144',
        'id': '11134339144',
        'type': 'user',
        'uri': 'spotify:user:11134339144'
    };
    'is_local': false;
    'primary_color': null;
    'track': {
        'album': {
            'album_type': 'single',
            'artists': [{
                'external_urls': {
                    'spotify': 'https://open.spotify.com/artist/1MF873qFvGywvDUQbldyMH'
                },
                'href': 'https://api.spotify.com/v1/artists/1MF873qFvGywvDUQbldyMH',
                'id': '1MF873qFvGywvDUQbldyMH',
                'name': 'Zaini',
                'type': 'artist',
                'uri': 'spotify:artist:1MF873qFvGywvDUQbldyMH'
            }, {
                'external_urls': {
                    'spotify': 'https://open.spotify.com/artist/57A8a9CoP4Bu1NZNvx0eeJ'
                },
                'href': 'https://api.spotify.com/v1/artists/57A8a9CoP4Bu1NZNvx0eeJ',
                'id': '57A8a9CoP4Bu1NZNvx0eeJ',
                'name': 'vict molina',
                'type': 'artist',
                'uri': 'spotify:artist:57A8a9CoP4Bu1NZNvx0eeJ'
            }],
            'available_markets': string[];
            'external_urls': {
                'spotify': 'https://open.spotify.com/album/18wlQBtWMIidnlL0BI7Axq'
            },
            'href': 'https://api.spotify.com/v1/albums/18wlQBtWMIidnlL0BI7Axq',
            'id': '18wlQBtWMIidnlL0BI7Axq',
            'images': [{
                'height': 640,
                'url': 'https://i.scdn.co/image/ab67616d0000b273fe3006f3fcdbddf0f4af59a1',
                'width': 640
            }, {
                'height': 300,
                'url': 'https://i.scdn.co/image/ab67616d00001e02fe3006f3fcdbddf0f4af59a1',
                'width': 300
            }, {
                'height': 64,
                'url': 'https://i.scdn.co/image/ab67616d00004851fe3006f3fcdbddf0f4af59a1',
                'width': 64
            }],
            'name': 'it\'s ok to leave',
            'release_date': '2021-08-06',
            'release_date_precision': 'day',
            'total_tracks': 1,
            'type': 'album',
            'uri': 'spotify:album:18wlQBtWMIidnlL0BI7Axq'
        },
        'artists': [{
            'external_urls': {
                'spotify': 'https://open.spotify.com/artist/1MF873qFvGywvDUQbldyMH'
            },
            'href': 'https://api.spotify.com/v1/artists/1MF873qFvGywvDUQbldyMH',
            'id': '1MF873qFvGywvDUQbldyMH',
            'name': 'Zaini',
            'type': 'artist',
            'uri': 'spotify:artist:1MF873qFvGywvDUQbldyMH'
        }, {
            'external_urls': {
                'spotify': 'https://open.spotify.com/artist/57A8a9CoP4Bu1NZNvx0eeJ'
            },
            'href': 'https://api.spotify.com/v1/artists/57A8a9CoP4Bu1NZNvx0eeJ',
            'id': '57A8a9CoP4Bu1NZNvx0eeJ',
            'name': 'vict molina',
            'type': 'artist',
            'uri': 'spotify:artist:57A8a9CoP4Bu1NZNvx0eeJ'
        }],
        'available_markets': ['AD', 'AE', 'AG', 'AL', 'AM', 'AO', 'AR', 'AT', 'AU', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BN', 'BO', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ', 'CA', 'CH', 'CI', 'CL', 'CM', 'CO', 'CR', 'CV', 'CW', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'ES', 'FI', 'FJ', 'FM', 'FR', 'GA', 'GB', 'GD', 'GE', 'GH', 'GM', 'GN', 'GQ', 'GR', 'GT', 'GW', 'GY', 'HK', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IN', 'IS', 'IT', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'MA', 'MC', 'MD', 'ME', 'MG', 'MH', 'MK', 'ML', 'MN', 'MO', 'MR', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NE', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NZ', 'OM', 'PA', 'PE', 'PG', 'PH', 'PK', 'PL', 'PS', 'PT', 'PW', 'PY', 'QA', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SE', 'SG', 'SI', 'SK', 'SL', 'SM', 'SN', 'SR', 'ST', 'SV', 'SZ', 'TD', 'TG', 'TH', 'TL', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ', 'VC', 'VN', 'VU', 'WS', 'XK', 'ZA', 'ZM', 'ZW'],
        'disc_number': 1,
        'duration_ms': 184864,
        'episode': false,
        'explicit': false,
        'external_ids': {
            'isrc': 'GBKQU2176394'
        },
        'external_urls': {
            'spotify': 'https://open.spotify.com/track/7qzml1MrEDlLJPAtwrCUWT'
        },
        'href': 'https://api.spotify.com/v1/tracks/7qzml1MrEDlLJPAtwrCUWT',
        'id': '7qzml1MrEDlLJPAtwrCUWT',
        'is_local': false,
        'name': 'it\'s ok to leave',
        'popularity': 34,
        'preview_url': 'https://p.scdn.co/mp3-preview/0beba9a23c441d654b3b8f53649d12e0c7ee8a2e?cid=c8e390667f904c54b5ee7d8d03b19f1d',
        'track': true,
        'track_number': 1,
        'type': 'track',
        'uri': 'spotify:track:7qzml1MrEDlLJPAtwrCUWT'
    };
    'video_thumbnail': {
        'url': null
    };
}

export interface ISpotifyPlaylist {
    'collaborative': false;
    'description': '';
    'external_urls': {
        'spotify': 'https://open.spotify.com/playlist/3imvNYosju8BSJPBw1nJrd'
    };
    'href': 'https://api.spotify.com/v1/playlists/3imvNYosju8BSJPBw1nJrd';
    'id': '3imvNYosju8BSJPBw1nJrd';
    'images': [{
        'height': 640,
        'url': 'https://i.scdn.co/image/ab67616d0000b273fe3006f3fcdbddf0f4af59a1',
        'width': 640
    }];
    'name': 'it\'s ok to leave';
    'owner': {
        'display_name': 'Kosmas Papadatos',
        'external_urls': {
            'spotify': 'https://open.spotify.com/user/11134339144'
        },
        'href': 'https://api.spotify.com/v1/users/11134339144',
        'id': '11134339144',
        'type': 'user',
        'uri': 'spotify:user:11134339144'
    };
    'primary_color': null;
    'public': false;
    'snapshot_id': 'MyxkMTczMzQ2Njg1YTdlZWNmMjlhODI4ZjU1ZGM4YjFhNTNlNTgzYjVi';
    'tracks': {
        'href': 'https://api.spotify.com/v1/playlists/3imvNYosju8BSJPBw1nJrd/tracks',
        'total': 2
    };
    'type': 'playlist';
    'uri': 'spotify:playlist:3imvNYosju8BSJPBw1nJrd';
}

export interface ISpotifyUser {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
        'filter_enabled': false,
        'filter_locked': false
    };
    external_urls: {
        spotify: string;
    };
    followers: {
        'href': null,
        'total': 7
    };
    href: string;
    id: string;
    images: [
        {
            'height': null,
            'url': 'https://scontent-cdt1-1.xx.fbcdn.net/v/t1.18169-1/p320x320/10411784_10204487237757191_4757950121941600840_n.jpg?_nc_cat=105&ccb=1-5&_nc_sid=0c64ff&_nc_ohc=351PN7XWvo8AX8LpGtG&_nc_ht=scontent-cdt1-1.xx&edm=AP4hL3IEAAAA&oh=6fdc2b949d202d12e75aa63b7c2a0439&oe=613B532C',
            'width': null
        }
    ];
    product: 'premium';
    type: 'user';
    uri: string;
}
