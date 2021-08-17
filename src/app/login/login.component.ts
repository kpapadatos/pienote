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
  public faSpotify = faSpotify;
  public oAuthUrl = this.spotify.getSpotifyOAuthUrl();
  constructor(
    public spotify: SpotifyService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }
  public ngOnInit(): void {
    this.route.queryParams.subscribe(async query => {
      if (query.code) {
        await this.spotify.loginWithCode(query.code);
        this.router.navigate(['app']);
      }
    });
  }
}
