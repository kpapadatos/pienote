import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ISignalSource } from '../../../../src/interfaces/Board';
import { AnimationBuilder, style, animate, AnimationPlayer } from '@angular/animations';
import * as moment from 'moment';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  @ViewChild('counter', { static: true }) counter: ElementRef;
  deadlineTop = 85;
  socket: WebSocket;
  lanes: ISignalSource[] = [
    { color: 'red' },
    { color: 'cyan' }
  ];
  boardWaterfallAnimationPlayers: AnimationPlayer[] = [];
  private factory = this.builder.build([
    style({ top: 0 }),
    animate(5000 / (85 / 100), style({ top: '100%' }))
  ]);
  constructor(private builder: AnimationBuilder) {
  }

  animateIndefinately(el: ElementRef) {
    const animation = this.factory.create(el.nativeElement, {});
    this.boardWaterfallAnimationPlayers.push(animation);
    animation.onDone(() => {
      this.boardWaterfallAnimationPlayers.splice(this.boardWaterfallAnimationPlayers.indexOf(animation), 1);
      animation.destroy();
      this.animateIndefinately(el);
    });
    animation.play();
  }

  ngOnInit() {
    this.socket = new WebSocket('ws://localhost:8000');

    this.animateIndefinately(this.counter);

    this.socket.onopen = () => {
      console.log('connected');
      this.socket.onmessage = async (event) => {
        const receivedAt = moment();
        const snareAudioFile = 'CYCdh_K1close_Snr-01.wav';
        const data = await event.data.arrayBuffer();
        console.log(moment().diff(receivedAt), data);
        (new Audio('/assets/audio/kits/Kit 1 - Acoustic close/CYCdh_K1close_Snr-01.wav')).play();
      };
    };
  }
}
