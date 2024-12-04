import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css']
})
export class PatientProfileComponent implements OnInit {

  constructor(public Router : Router) { }

  ngOnInit(): void {
  }
  addBilling() {
    this.Router.navigateByUrl('/p/add-billing');
  }
  editBilling() {
    this.Router.navigateByUrl('/p/edit-billing');
  }
  addPrescription() {
    this.Router.navigateByUrl('/p/add-prescription');
  }
  editPrescription() {
    this.Router.navigateByUrl('/p/edit-prescription');
  }
}
