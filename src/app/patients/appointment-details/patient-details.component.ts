import { MessageService } from '../../core/services/message/message.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiUrl } from '../../core/apiUrl';
import { HttpService } from '../../core/services/http/http.service';
import { UserService } from '../../core/services/user/user.service';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { HtmlCharService } from 'src/app/htmchar-service.service';
@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css'],
})
export class PatientDetailsComponent implements OnInit {
  public reports = [];
  public medicineList = [];
  public userId = 0;
  prescription = '';
  appointmentId = '0';
  doctorId = '0';
  patientHistory = [];
  userSubscription: Subscription;
  userRole;
  userData;
  doctorDetails;
  refferedHistory = [];
  customerSuggestionList = [];
  appointment;
  enableCalling = false;
  constructor(
    private http: HttpService,
    private user: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private message: MessageService,
    private htmlCharService: HtmlCharService
  ) {}

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.params.appointment_id;
    this.doctorId = this.route.snapshot.params.doc_id;
    //
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userRole = userData.result[0].ROLE;
          this.userData = userData.result[0];
          this.userId = userData.result[0].USERID;
          Promise.all([
            this.getPatientPrescriptionDetails(this.userId),
            this.getDoctorProfile(),
            this.getReferralHistory(),
            this.getSuggestionsForAppointment(),
            this.getAppointmentDetails(),
          ]);
        }
      }
    );
  }

  /*** Get Doctor Profile ***/
  getDoctorProfile(): void {
    this.http
      .postData(ApiUrl.getPeopleInfo, { peopleId: this.doctorId })
      .subscribe(
        (resp: any) => {
          if (!!resp && resp.data) {
            const result = resp.data;
            this.doctorDetails = result;
          }
        },
        (error) => console.log(error)
      );
  }

  getSuggestionsForAppointment() {
    if (!this.appointmentId) {
      return;
    }
    const params = {
      query: `Call RN_GET_APPOINTMENT_SUGGESTIONS(${this.appointmentId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.customerSuggestionList = data;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getReferralHistory() {
    const params = {
      query: `Call RN_GET_REFFERED_CUSTOMER_DETAILS( ${this.userId},${this.appointmentId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.refferedHistory = data;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  getPatientPrescriptionDetails(id) {
    //
    const params = {
      query: `Call RN_PATIENT_HISTORY(${id})`,
      params: '',
    };
    this.arrayHistory = [];
    this.patientHistory = [];
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const pdata =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.patientHistory = pdata;
          var data = pdata.filter(
            (x) => +x.APPOINTMENT_ID === +this.appointmentId
          );
          //
          this.groupBy(data, 'PID');
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getAppointmentDetails(): void {
    if (!this.appointmentId) {
      return;
    }
    const params = {
      query: `Call RN_APPOINTMENT_GET_BY_ID(${this.appointmentId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result[0] : [];
          this.appointment = data;
          const today = moment();
          debugger;
          console.log(this.appointment.APPOINTMENT_TIME);
          const dateTime =
            this.appointment.APPOINTMENT_DATE +
            ' ' +
            this.appointment.APPOINTMENT_TIME;
          if (
            moment(dateTime, 'YYYY-MM-DD hh:mm A').isSame(today, 'day') &&
            today.isAfter(
              moment(this.appointment.APPOINTMENT_TIME, 'hh:mm A')
            ) &&
            today.isBefore(
              moment(this.appointment.APPOINTMENT_ENDTIME, 'hh:mm A')
            )
          ) {
            this.enableCalling = true;
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  videoCall(): void {
    localStorage.setItem(
      'call_room',
      this.appointment.DOCTOR_FIRST_NAME +
        '' +
        this.appointment.DOCTOR_LAST_NAME
    );
    const params = {
      ToUserId: `${this.appointment.DOCTOR_ID}`,
      UserType: 'D',
      Room: `${
        this.appointment.DOCTOR_FIRST_NAME +
        '' +
        this.appointment.DOCTOR_LAST_NAME
      }`,
      appointmentId: `${this.appointment.RN_APPOINTMENT_ID}`,
      CallerId: `${this.appointment.CUSTOMER_ID}`,
      CallerType: 'P',
    };
    this.http.postData(ApiUrl.notifyUser, params).subscribe((resp) => {
      this.router.navigate(['/p/chat-portal', this.appointmentId]);
    });
  }

  public arrayHistory = [];
  groupBy(objectArray, property) {
    this.arrayHistory = [];
    return objectArray.reduce((acc, obj) => {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      // Add object to list for given key's value
      acc[key].push(obj);
      if (this.arrayHistory.filter((x) => x.id == key).length > 0) {
        //
        this.arrayHistory.filter((x) => x.id == key)[0].items.push(obj);
      } else {
        this.arrayHistory.push({
          id: key,
          APPOINTMENT_DATE: obj.APPOINTMENT_DATE,
          PRESCRIPTION_DATE: obj.PRESCRIPTION_DATE,
          PRESCRIPTION_BY: obj.PRESCRIPTION_BY,
          Notes: this.htmlCharService.decodeHtmlCharCodes(obj.Notes),
          items: [obj],
        });
      }
      this.arrayHistory.sort((a, b) => {
        return b.id - a.id;
      });
      console.log(this.arrayHistory);
      return acc;
    }, {});
  }

  printPrescription(): void {
    this.http
      .postData(ApiUrl.printPrescription, { patientId: this.userId })
      .subscribe(
        (resp: any) => {
          if (!!resp && resp.data && resp.data.path) {
            window.open(resp.data.path, '_blank');
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  /*** Intiate User Call ***/
  callUser(): void {
    const user = {
      name:
        this.doctorDetails.Prefix +
        ' ' +
        this.doctorDetails.FIRST_NAME +
        ' ' +
        this.doctorDetails.LAST_NAME,
      image: this.doctorDetails.BASE64CONTENT,
      userType: 1,
      mobile: this.doctorDetails.Mobile,
    };
    this.user.setCallUser(user);
  }
}
