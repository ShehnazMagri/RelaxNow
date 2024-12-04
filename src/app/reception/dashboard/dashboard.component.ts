import { MessageService } from 'src/app/core/services/message/message.service';
import { ApiUrl } from './../../core/apiUrl';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/core/services/http/http.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader/loader.service';
import { DataTableDirective } from 'angular-datatables';
declare var $: any;
declare var Morris: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  public docters = [];
  public patients = [];
  public appointments = [];
  public toDateAppointment = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger1: Subject<any> = new Subject<any>();
  dtTrigger2: Subject<any> = new Subject<any>();
  dtTrigger3: Subject<any> = new Subject<any>();
  public revenue;

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  constructor(
    private http: HttpService,
    private loader: LoaderService,
    private msg: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    //this.getRevenue();
    this.getDashboardData();

    const chartAreaData = [
      { y: '2006', a: 100, b: 90 },
      { y: '2007', a: 75, b: 65 },
      { y: '2008', a: 50, b: 40 },
      { y: '2009', a: 75, b: 65 },
      { y: '2010', a: 50, b: 40 },
      { y: '2011', a: 75, b: 65 },
      { y: '2012', a: 100, b: 90 },
    ];
    const chartLineData = [
      { y: '2006', a: 100, b: 90 },
      { y: '2007', a: 75, b: 65 },
      { y: '2008', a: 50, b: 40 },
      { y: '2009', a: 75, b: 65 },
      { y: '2010', a: 50, b: 40 },
      { y: '2011', a: 75, b: 65 },
      { y: '2012', a: 100, b: 90 },
    ];

    /* Morris Area Chart */
  }
  getDashboardData(): void {
    const params1 = {
      query: 'call RN_PEOPLE_SEARCH()',
      params: '',
    };

    const params2 = {
      query: 'call RN_CUSTOMER_GET()',
      params: '',
    };
    const params3 = {
      query: 'call RN_DOCTOR_APPOINTMENTS(0,null)',
      params: '',
    };
    forkJoin(
      this.http.postData(ApiUrl.common, params1),
      this.http.postData(ApiUrl.common, params2),
      this.http.postData(ApiUrl.common, params3)
    ).subscribe(([doctorData, patientData, appointmentData]) => {
      const result1 =
        doctorData.data && doctorData.data[0].result
          ? doctorData.data[0].result
          : [];
      this.docters = result1;
      const result2 =
        patientData.data && patientData.data[0].result
          ? patientData.data[0].result
          : [];
      this.patients = result2;
      const result3 =
        appointmentData.data && appointmentData.data[0].result
          ? appointmentData.data[0].result
          : [];

      let date: Date = new Date();

      this.appointments = this.sortAppointments(result3);
      this.toDateAppointment = this.appointments.filter((item: any) => {
        return (item.APPOINTMENT_DATE = date);
      });

      this.dtTrigger1.next();
      this.dtTrigger2.next();
      this.dtTrigger3.next();
    });
  }

  /*** Open Patient Details ***/
  openPatientModal(patient): void {
    this.router.navigate(['/reception/patient-details', patient.ID]);
  }

  /*** Re-render Datatable ***/
  rerender(): void {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again
        this.dtTrigger3.next();
      });
    }
  }
  getDoctors(): void {
    const params = {
      query: 'call RN_PEOPLE_SEARCH()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.docters = result;
          // this.categoryData = result.filter((v) => {
          //   if (v.ACTIVE) {
          //     return v;
          //   }
          // });
          this.dtTrigger3.next();
        }
      },
      (error) => console.log(error)
    );
  }

  getPatients(): void {
    const params = {
      query: 'call RN_CUSTOMER_GET()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.patients = result;
          // this.categoryData = result.filter((v) => {
          //   if (v.ACTIVE) {
          //     return v;
          //   }
          // });
          this.dtTrigger2.next();
        }
      },
      (error) => console.log(error)
    );
  }

  getAppointments(): void {
    const params = {
      query: 'call RN_DOCTOR_APPOINTMENTS(0,null)',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.appointments = this.sortAppointments(result);
          this.rerender();
        }
      },
      (error) => console.log(error)
    );
  }
  getRevenue(): void {
    const params = {
      query: 'call RN_REVENUE_SP()',
      params: '',
    };
    this.http.postData('/api/executesp', params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result = resp.data;
          this.revenue = result.resultset0[0].Revenue;
          const data1 = [];
          result.resultset1.forEach((element) => {
            data1.push({ a: element.a, y: element.y.toString() });
          });
          Morris.Area({
            element: 'morrisArea',
            data: data1,
            xkey: 'y',
            ykeys: ['a'],
            labels: ['Revenue'],
            lineColors: ['#1b5a90'],
            lineWidth: 2,

            fillOpacity: 0.5,
            gridTextSize: 10,
            hideHover: 'auto',
            resize: true,
            redraw: true,
          });
          const data2 = [];
          result.resultset2.forEach((element) => {
            data2.push({ a: element.a, y: element.y.toString() });
          });
          /* Morris Line Chart */
          Morris.Line({
            element: 'morrisLine',
            data: data2,
            xkey: 'y',
            ykeys: ['a'],
            labels: ['Patients'],
            lineColors: ['#ff9d00'],
            lineWidth: 1,
            gridTextSize: 10,
            hideHover: 'auto',
            resize: true,
            redraw: true,
          });
        }
      },
      (error) => console.log(error)
    );
  }
  /*** Confirm Cancel Appointment ***/
  confirm(selectedAppointment, type): void {
    const params = {
      Patient_Name:
        selectedAppointment.RN_CUSTOMER_FIRST_NAME +
        ' ' +
        selectedAppointment.RN_CUSTOMER_LAST_NAME,
      Email: selectedAppointment.RN_CUSTOMER_EMAIL,
      Template_Name: 'APPOINTMENT_CANCELED',
      Dr_Name:
        selectedAppointment.DOCTOR_Prefix +
        ' ' +
        selectedAppointment.DOCTOR_FIRST_NAME +
        ' ' +
        selectedAppointment.DOCTOR_LAST_NAME,
      Date_Time:
        selectedAppointment.APPOINTMENT_DATE +
        ' ' +
        selectedAppointment.APPOINTMENT_TIME,
      Reason_Unavailability: 'Unavailable',
    };
    this.msg.confirm('change the status of an Appointment').then((data) => {
      if (data.value) {
        this.http.postData(ApiUrl.email, params).subscribe(
          (resp: any) => {
            if (!!resp) {
              const params2 = {
                query: `call RN_CANCEL_APPOINTMENT(${selectedAppointment.RN_APPOINTMENT_ID},${type})`,
                params: '',
              };
              this.http.postData(ApiUrl.queryExecute, params2).subscribe(
                (resp: any) => {
                  if (!!resp) {
                    this.getAppointments();
                    this.msg.showSuccess('Status Changed Successfully');
                    // window.location.reload();
                  }
                },
                (error) => console.log(error)
              );
            }
          },
          (error) => console.log(error)
        );
      } else {
        this.getAppointments();
      }
    });
  }
  /*** Sort Array by prescription and date ***/
  sortAppointments(data): any[] {
    this.loader.show();

    const result1 = [];
    const result2 = [];
    data.forEach((element) => {
      if (!element.PRESCRIPTION_ID || element.PRESCRIPTION_ID == '0') {
        result1.push(element);
      } else {
        result2.push(element);
      }
    });
    if (result1.length) {
      result1.sort((a, b) => {
        const dateA: any = new Date(
          a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME
        );
        const dateB: any = new Date(
          b.APPOINTMENT_DATE + ' ' + b.APPOINTMENT_TIME
        );
        return dateA - dateB;
      });
    }
    if (result2.length) {
      result2.sort((a, b) => {
        const dateA: any = new Date(
          a.APPOINTMENT_DATE + ' ' + a.APPOINTMENT_TIME
        );
        const dateB: any = new Date(
          b.APPOINTMENT_DATE + ' ' + b.APPOINTMENT_TIME
        );
        return dateA - dateB;
      });
    }

    setTimeout(() => {
      this.loader.hide();
    }, 100);
    return result1.concat(result2);
  }
  /*** UnSubscribe the events to prevent memory leakage ***/
  ngOnDestroy(): void {
    this.dtTrigger1.unsubscribe();
    this.dtTrigger2.unsubscribe();
    this.dtTrigger3.unsubscribe();
  }
}
