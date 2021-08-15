import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ISpotifyPlaylist, ISpotifyTrack, SpotifyService } from 'src/services/spotify.service';

@Component({
  selector: 'app-tracklist',
  templateUrl: './tracklist.component.html',
  styleUrls: ['./tracklist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TracklistComponent implements OnInit {
  @Input() playlist!: ISpotifyPlaylist;
  tracks$ = new BehaviorSubject([] as ISpotifyTrack[]);
  constructor(private spotify: SpotifyService) { }
  @HostBinding('style.display') display = 'none';
  async ngOnInit(): Promise<void> {
    if (this.playlist.tracks.total) {
      this.tracks$.next((await this.spotify.getPlaylistTracks(this.playlist.id)).items);
    }
  }
  toggle() {
    if (this.display === 'none') {
      this.display = 'flex';
    } else {
      this.display = 'none';
    }
  }
}
