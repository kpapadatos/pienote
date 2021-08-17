import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faInfoCircle, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { parseArrayBuffer } from 'midi-json-parser';
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
  public analysis$ = new BehaviorSubject<ISpotifyTrackAnalysis | undefined>(undefined);
  public player$ = new BehaviorSubject<SpotifyPlayer | undefined>(undefined);
  public faPlay = faPlay;
  public faPause = faPause;
  public faInfoCircle = faInfoCircle;
  public trackId?: string;
  constructor(private route: ActivatedRoute, private spotify: SpotifyService) { }
  public ngOnDestroy(): void {
    this.player$.getValue()?.dispose();
  }
  public ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.player$.getValue()?.dispose();
      this.player$.next(undefined);
      this.analysis$.next(undefined);

      this.trackId = params.trackId;
      this.loadPlayer(params.trackId);
      this.loadAnalysis(params.trackId);
      this.tryGetMIDIFile(params.trackId);
    });
  }
  public seek(pc: number) {
    const player = this.player$.getValue();
    const state = player?.state$.getValue();
    if (player?.trackId && state?.duration) {
      console.log(pc, state?.duration);
      player.seek(pc * state?.duration);
    }
  }
  public async togglePlay() {
    const player = this.player$.getValue() as SpotifyPlayer;
    const trackId = this.trackId as string;
    if (!player.trackId) {
      player.trackId = trackId;
      await this.spotify.setTrack(trackId, player.deviceId);
    } else {
      await player.togglePlay();
    }
  }
  private async tryGetMIDIFile(trackId: string) {
    const res = await fetch(`/assets/midi/${trackId}.mid`);
    const jsonMidi = await parseArrayBuffer(await res.arrayBuffer());
    console.log({ jsonMidi });
  }
  private async loadPlayer(trackId: string) {
    const player = await createSpotifyPlayer(this.spotify.getAccessToken() as string);
    this.player$.next(player);
  }
  private async loadAnalysis(trackId: string) {
    this.analysis$.next(await this.spotify.getTrackAnalysis(trackId));
  }
}
