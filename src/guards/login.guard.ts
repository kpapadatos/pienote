import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SpotifyService } from 'src/services/spotify.service';

@Injectable()
export class LoginGuard implements CanActivate {
    constructor(
        private spotify: SpotifyService,
        private router: Router
    ) { }
    async canActivate() {
        let isLoggedIn = this.spotify.isLoggedIn();

        if (isLoggedIn) {
            try {
                await this.spotify.getUser();
            } catch {
                isLoggedIn = false;
            }
        }

        return !isLoggedIn || this.router.navigate(['app']);
    }
}