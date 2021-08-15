import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { createSpotifyPlayer, SpotifyPlayer } from 'src/common/classes/SpotifyPlayer';
import { ISpotifyTrackAnalysis, SpotifyService } from 'src/services/spotify.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameComponent implements OnInit, OnDestroy {
  analysis$ = new BehaviorSubject<ISpotifyTrackAnalysis | undefined>(undefined);
  player$ = new BehaviorSubject<SpotifyPlayer | undefined>(undefined);
  faPlay = faPlay;
  faPause = faPause;
  constructor(private route: ActivatedRoute, private spotify: SpotifyService) { }
  ngOnDestroy(): void {
    this.player$.getValue()?.dispose();
  }
  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.player$.getValue()?.dispose();
      this.player$.next(undefined);
      this.analysis$.next(undefined);

      this.loadPlayer(params.trackId);
      this.loadAnalysis(params.trackId);
    });
  }
  private async loadPlayer(trackId: string) {
    const player = await createSpotifyPlayer(this.spotify.getToken() as string);
    await this.spotify.setTrack(trackId, player.deviceId);
    await this.spotify.setPlaybackDevice(player.deviceId);
    await player.seek(0);
    this.player$.next(player);
  }
  private async loadAnalysis(trackId: string) {
    this.analysis$.next(await this.spotify.getTrackAnalysis(trackId));
  }
}
