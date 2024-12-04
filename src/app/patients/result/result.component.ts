import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { trim } from 'jquery';

export interface Doctors {
  id: number;
  doctor_name: string;
  speciality: string;
  Education: string;
  location: string;
}

@Component({
  selector: 'app-user-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css'],
})
export class UserResultComponent implements OnInit {
  resultData = null;
  email: null;
  pendingTest:any;
  constructor(private http: HttpService, private message: MessageService, private user: UserService,private router: Router) {}
  ngOnInit(): void {
    this.resultData = JSON.parse(localStorage.getItem('resultData'));
    if (this.user.currentUserValue.result[0].CORPORATECODE) {
      this.checkPendingTests( this.user.currentUserValue.result[0].CORPORATECODE);
    }
  }

  sendReport(): void {
    if (this.email == null || trim(this.email) == '') {
      this.message.showError('Email is required.');
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.message.showError('Email address is not valid.');
      return;
    }
    var reportName=this.resultData.report.split("/");
    var name = reportName[reportName.length-1];
      var params = {
        email: this.email,
        Test_ID: this.resultData.Test_ID,
        testName: this.resultData.testName,
        Patient_Name: this.resultData.Patient_Name,
        reportName: name,
        reportPath:this.resultData.report,
      };
      this.http.postData(`/report/send-report`, params).subscribe((resp: any) => {
        if (!!resp) {
          this.message.showSuccess('Report sent successfully.');
        }
      });

  }

  validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  checkPendingTests(code): void {
    debugger;
    const params = {
      query: `Call RN_GET_CORPPRATE_USER_NOT_COMPLETED_TEST('${code}','${this.user.currentUserValue.result[0].USERID}')`,
      params: '',
    };

    this.http.postData(ApiUrl.queryExecute, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.pendingTest = resp.data;
        }
      },
      (error) => console.log(error)
    );
  }

  startNextTest(item)
  {
    localStorage.setItem('_TestId', item.testId);
    localStorage.setItem('CART_DETAIL_ID', '0');
    this.router.navigateByUrl('/p/test-details');
  }
}
