import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ISpotifyPlaylist, ISpotifyUser, SpotifyService } from './spotify.service';

@Injectable()
export class StoreService {
    public user$ = new BehaviorSubject<ISpotifyUser | undefined>(undefined);
    public playlists$ = new BehaviorSubject<ISpotifyPlaylist[] | undefined>(undefined);
    constructor(
        private spotify: SpotifyService,
        private router: Router
    ) {
        this.init();
    }
    public logout() {
        this.spotify.clearSessionTokens();
        this.router.navigate(['login']);
    }
    private async init() {
        this.loadUser();
        this.loadPlaylists();
    }
    private async loadUser() {
        this.user$.next(await this.spotify.getUser());
    }
    private async loadPlaylists() {
        this.playlists$.next((await this.spotify.getPlaylists()).items);
    }
}
