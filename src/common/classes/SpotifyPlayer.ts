import { BehaviorSubject } from 'rxjs';
import { SpotifyService } from 'src/services/spotify.service';

export class SpotifyPlayer {
    public ready!: Promise<void>;
    public deviceId!: string;
    public trackId?: string;
    public isPlaying$ = new BehaviorSubject(false);
    public state$ = new BehaviorSubject<ISpotifyPlayerStatus | undefined>(undefined);
    private player = new (window as any).Spotify.Player({
        name: 'PieNote Player',
        getOAuthToken: async (cb: (accessToken: string) => void) => {
            await this.spotify.refreshTokens();
            cb(this.spotify.getAccessToken() as string);
        },
    });
    constructor(private spotify: SpotifyService) {
        Object.assign(window, { player: this.player });
        this.player.connect();
        this.ready = new Promise(resolve => {
            this.player.addListener('ready', ({ device_id }: { device_id: string }) => {
                this.deviceId = device_id;
                resolve();
            });
        });
        this.player.addListener('player_state_changed', (state: any) => {
            this.state$.next(state);

            if (!state) {
                return;
            }

            const isPlaying = !state.paused && !state.loading;

            if (isPlaying !== this.isPlaying$.getValue()) {
                this.isPlaying$.next(isPlaying);
            }
        });
        this.player.addListener('initialization_error', ({ message }: { message: string }) => {
            console.error(message);
        });
        this.player.addListener('authentication_error', ({ message }: { message: string }) => {
            console.error(message);
        });
        this.player.addListener('account_error', ({ message }: { message: string }) => {
            console.error(message);
        });
        this.player.addListener('playback_error', ({ message }: { message: string }) => {
            console.error(message);
        });
        this.player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
            console.log('Device ID has gone offline', device_id);
        });
    }
    public dispose() {
        this.player.disconnect();
    }
    public async togglePlay() {
        await this.player.togglePlay();
    }
    public async seek(ms: number) {
        await this.player.seek(ms);
    }
    public async pause() {
        await this.player.pause();
    }
    public async getCurrentState() {
        const state = await this.player.getCurrentState() as ISpotifyPlayerStatus;
        this.state$.next(state);
        return state;
    }
}

export async function createSpotifyPlayer(spotify: SpotifyService) {
    await (window as any)._spotifyReady;
    const player = new SpotifyPlayer(spotify);
    await player.ready;
    return player;
}

export interface ISpotifyPlayerStatus {
    duration: number;
    position: number;
    track_window: {
        current_track: {
            id: string;
        }
    };
}
