import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { PatientDetailsComponent } from 'src/app/patient-details/patient-details.component';

@Component({
  selector: 'app-mypatients',
  templateUrl: './mypatients.component.html',
  styleUrls: ['./mypatients.component.css'],
})
export class MypatientsComponent implements OnInit, OnDestroy {
  appointments: any = [];
  patients: any = [];
  userSubscription: Subscription;
  userId = 0;
  searchText = '';
  dateSelected = '0';
  userData;
  constructor(
    private modal: NgbModal,
    private http: HttpService,
    private user: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userId = userData.result[0].USERID;
          this.userData = userData.result[0];
        }
      }
    );
    this.getPatientsByDate();
  }

  getPatients(date) {
    const params = {
      query: `Call RN_GET_DOCTOR_PATIENTS(${this.userId},'${date}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.patients =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  getPatientsByDate() {
    const date = moment();
    let slectedDate = '';
    switch (this.dateSelected) {
      case '0':
        slectedDate = date.clone().startOf('month').format('YYYY-MM-DD');
        break;
      case '1':
        slectedDate = date
          .clone()
          .subtract(1, 'months')
          .startOf('month')
          .format('YYYY-MM-DD');
        break;
      case '2':
        slectedDate = date
          .clone()
          .subtract(3, 'months')
          .startOf('month')
          .format('YYYY-MM-DD');
        break;

      case '3':
        slectedDate = date
          .clone()
          .subtract(6, 'months')
          .startOf('month')
          .format('YYYY-MM-DD');
        break;

      case '4':
        slectedDate = date.clone().subtract(1, 'years').format('YYYY-MM-DD');
        break;
      default:
        slectedDate = '';
        break;
    }
    this.getPatients(slectedDate);
  }
  /*** Open Patient Details ***/
  openPatientModal(patient): void {
    const modalRef = this.modal.open(PatientDetailsComponent, {
      scrollable: false,
    });

    modalRef.componentInstance.patient = patient;
    modalRef.result.then(
      (result) => {
        console.log(result);
      },
      (reason) => {}
    );
  }

  sendPushNOtification(appointment): void {
    debugger;
    localStorage.setItem(
      'call_room',
      `${this.userData.FIRSTNAME + '' + this.userData.LASTNAME}`
    );
    const params = {
      ToUserId: `${appointment.CUSTOMER_ID}`,
      UserType: 'P',
      Room: `${this.userData.FIRSTNAME + '' + this.userData.LASTNAME}`,
      appointmentId: `${appointment.APPOINTMENT_ID}`,
      CallerId: `${appointment.PEOPLE_ID}`,
      CallerType: 'D',
    };

    this.http.postData(ApiUrl.notifyUser, params).subscribe((resp) => {
      this.router.navigate(['/doctor/chat-portal', appointment.APPOINTMENT_ID]);
    });
  }
  /*** Intiate User Call ***/
  callUser(people: any): void {
    this.user.setCallUser(people);
  }
  /*** On Component Destory ***/
  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  addChatToAppointment(appointmentDetails) {
    localStorage.setItem('ChatChannelID', appointmentDetails.CUSTOMER_ID);
    this.router.navigateByUrl('/doctor/message');
  }
}
