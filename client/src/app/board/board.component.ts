import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input, AfterViewInit } from '@angular/core';
import { ISignalSource } from '../../../../src/interfaces/Board';
import { AnimationPlayer } from '@angular/animations';
import { MetronomeLineDirective } from './MetronomeLineDirective';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, AfterViewInit {
  @ViewChildren(MetronomeLineDirective) ageables: QueryList<MetronomeLineDirective>;
  isPlaying = false;
  visibleTimelineMs = 5000;
  metronomeLines: any[] = [];
  deadlineTop = 85;
  socket: WebSocket;
  lanes: ISignalSource[] = [
    { color: 'red' },
    { color: 'cyan' }
  ];
  boardWaterfallAnimationPlayers: AnimationPlayer[] = [];

  constructor() {
  }

  togglePlayState() {
    this.isPlaying = !this.isPlaying;
  }

  play() {
    for (const metronomeLine of this.ageables.toArray()) {
      metronomeLine.animationPlayer.play();
    }
  }

  pause() {
    for (const metronomeLine of this.ageables.toArray()) {
      metronomeLine.animationPlayer.pause();
    }
  }

  async createMetronomeLineGrid() {
    this.metronomeLines.push(1e3);
    this.metronomeLines.push(2e3);
    this.metronomeLines.push(3e3);
    this.metronomeLines.push(4e3);
    this.metronomeLines.push(5e3);
  }

  ngAfterViewInit() {
    this.createMetronomeLineGrid();
  }

  ngOnInit() {
    this.socket = new WebSocket('ws://localhost:8000');

    this.socket.onopen = () => {
      console.log('connected');
      this.socket.onmessage = (event) => {
        const snareAudioFile = 'CYCdh_K1close_Snr-01.wav';
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.channel === 9 && data.note === 38 && data._type === 'noteon') {
          (new Audio('/assets/audio/kits/Kit 1 - Acoustic close/CYCdh_K1close_Snr-01.wav')).play();
        }
      };
    };
  }
}
