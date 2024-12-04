import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css'],
})
export class SuccessComponent implements OnInit {
  appointmentId;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.paramMap.get('appointment_id');
  }
}
