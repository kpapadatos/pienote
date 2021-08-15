import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { SpotifyService } from 'src/services/spotify.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  faSpotify = faSpotify

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spotify: SpotifyService
  ) { }

  ngOnInit(): void {
    this.route.fragment.subscribe((fragment: string | null) => {
      const accessToken = fragment?.match(/access_token=([^\&]+)/)?.[1];

      if (accessToken) {
        this.spotify.setToken(accessToken);
        this.router.navigate(['app']);
      }
    });
  }
  public getSpotifyOAuthUrl() {
    return `https://accounts.spotify.com/authorize?response_type=token&client_id=c8e390667f904c54b5ee7d8d03b19f1d&redirect_uri=${encodeURIComponent(location.href)}&scope=streaming+user-read-email+user-modify-playback-state+user-read-private+playlist-read-private&show_dialog=true`;
  }
}
