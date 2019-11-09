import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input, AfterViewInit } from '@angular/core';
import { ISignalSource } from '../../../../src/interfaces/Board';
import { AnimationPlayer } from '@angular/animations';
import { MetronomeLineDirective } from './MetronomeLineDirective';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  @ViewChildren(MetronomeLineDirective) ageables: QueryList<MetronomeLineDirective>;
  isPlaying = false;
  isMetronomePlaying = false;
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

  async toggleMetronome() {
    this.isMetronomePlaying = !this.isMetronomePlaying;
    const response = await fetch(`http://localhost:8000/api/metronome/${this.isMetronomePlaying ? 'on' : 'off'}`);
    const interval = +(await response.text());

    let msFromDeadline = 0;

    while (msFromDeadline <= this.visibleTimelineMs) {
      this.metronomeLines.push(msFromDeadline);
      msFromDeadline += interval;
    }

    this.isPlaying = true;
  }
  togglePlayState() {
    this.isPlaying = !this.isPlaying;

    if (!this.isPlaying) {
      this.metronomeLines = [];
    }
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

  ngOnInit() {
    this.socket = new WebSocket('ws://localhost:8000');

    this.socket.onopen = () => {
      console.log('connected');
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

      };
    };
  }
}
