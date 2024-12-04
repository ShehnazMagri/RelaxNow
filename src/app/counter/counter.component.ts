import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.css'],
})
export class CounterComponent implements OnInit, OnDestroy {
  counter = '00:00';
  countDownInterval;
  interval = 0;
  constructor() {}
  ngOnInit() {
    this.countDownInterval = setInterval(() => {
      const minutes = Math.floor(this.interval / 60);
      const seconds = Math.floor(this.interval % 60);

      this.counter =
        (minutes < 10 ? '0' + minutes : minutes) +
        ':' +
        (seconds < 10 ? '0' + seconds : seconds);
      this.interval++;
    }, 1000);
  }
  ngOnDestroy() {
    if (this.countDownInterval) {
      clearInterval(this.countDownInterval);
    }
  }
}
