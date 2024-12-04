import { ActivatedRoute } from '@angular/router';
import { TestURL } from './../../core/apiUrl';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { ViewChild } from '@angular/core';
import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';
import { ClipboardService } from 'ngx-clipboard';
var CryptoJS = require('crypto-js');
const now = new Date();
@Component({
  selector: 'app-schedule-Test',
  templateUrl: './schedule-test.component.html',
  styleUrls: ['./schedule-test.component.css'],
})
export class ScheduleTestComponent implements OnInit {
  modalRef: BsModalRef;
  showFileUpload = true;
  createdBy = 'A';
  testID = 0;
  testData = [];
  csvRecords: any[] = [];
  newUsers: any[] = [];
  header = true;
  currentDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  testModel = {
    name: null,
    testId: 0,
    validFrom: null,
    validTo: null,
    noOfUsers: null,
    url: null,
    id: 0,
    anonymous: false,
  };
  userModel = {
    Name: null,
    Phone: null,
    Email: null,
    Address: null,
    CreatedBy: this.createdBy,
    Id: 0,
    TestId: this.testID,
  };
  notificationModel = {
    notificationDate: this.testModel.validFrom,
    notificationEndDate: this.testModel.validTo,
    sendNotification: false,
    reminderDays: null,
    testId: this.testID,
  };
  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private message: MessageService,
    private ngxCsvParser: NgxCsvParser,
    private _clipboardService: ClipboardService,
    private route: ActivatedRoute
  ) {}
  @ViewChild('fileImportInput', { static: false }) fileImportInput: any;

  // Listen for input event on numInput.

  ngOnInit(): void {
    //
    this.testID = this.route.snapshot.params.id;
    this.getTestList();
    // console.log(this.currentDate);
    // this.currentDate = new Date();
  }
  //#region Test Tab

  getTestList(): void {
    const params = {
      query: 'Call RN_SP_GET_EWI_TEST()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          this.testData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          if (
            this.testID != 0 &&
            this.testID != null &&
            this.testID != undefined
          ) {
            Promise.all([
              this.getScheduledTest(),
              this.getActiveNotification(),
            ]);
          }
        }
      },
      (error) => console.log(error)
    );
  }

  getScheduledTest(): void {
    const params = {
      query: `Call RN_SCHEDULE_TEST_GET('${this.testID}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          var testData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          const _startDate = testData[0].START_DATE.split('-');
          var startDate = {
            year: +_startDate[0],
            month: +_startDate[1],
            day: +_startDate[2].split('T')[0],
          };

          const _endDate = testData[0].END_DATE.split('-');
          var endDate = {
            year: +_endDate[0],
            month: +_endDate[1],
            day: +_endDate[2].split('T')[0],
          };
          //
          var anonymous = false;
          if (testData[0].ANONYMOUS == 1 || testData[0].ANONYMOUS == '1') {
            anonymous = true;
          }
          this.testModel = {
            name: testData[0].NAME,
            testId: parseInt(testData[0].TEST_ID),
            validFrom: startDate,
            validTo: endDate,
            noOfUsers: testData[0].NO_OF_USERS,
            url: testData[0].URL,
            id: testData[0].ID,
            anonymous: anonymous,
          };
        }
      },
      (error) => console.log(error)
    );
  }

  insertScheduledTest(): void {
    if (
      this.testModel.name == null ||
      this.testModel.name == '' ||
      this.testModel.testId == null ||
      this.testModel.validFrom == null ||
      this.testModel.validFrom == '' ||
      this.testModel.validTo == null ||
      this.testModel.validTo == '' ||
      this.testModel.noOfUsers == null ||
      this.testModel.noOfUsers == ''
    ) {
      this.message.showError('All mandatory(*) fields are required.');
      return;
    }
    const params = {
      query: `Call RN_CHECK_EXISTANCE_OF_TEST_NAME('${this.testModel.name}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          var response =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          if (response.length > 0 && this.testID == undefined) {
            this.message.showError(
              `Test name ${this.testModel.name} already exists.`
            );
          } else {
            this.addTest();
          }
        }
      },
      (error) => console.log(error)
    );
  }

  addTest() {
    var url = CryptoJS.AES.encrypt(this.testModel.name, '@Test').toString();
    url = url.replaceAll('+', 'xMl3Jk');
    url = url.replaceAll('/', 'Por21Ld');
    url = url.replaceAll('=', 'Ml32');
    url = TestURL + url;
    this.testModel.url = url;
    //
    var anonymous = 0;
    if (this.testModel.anonymous == true) {
      anonymous = 1;
    }
    const params = {
      query: `Call RN_SCHEDULE_TEST_INSERT('${this.testModel.name}','${this.testModel.testId}','${this.testModel.validFrom.year}-${this.testModel.validFrom.month}-${this.testModel.validFrom.day} 20:00:02','${this.testModel.validTo.year}-${this.testModel.validTo.month}-${this.testModel.validTo.day} 20:00:02','${this.testModel.noOfUsers}','${url}','1', '${this.testID}','${anonymous}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          var response =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.testID = response[0].test_id;
          localStorage.setItem('secheduledTestId', response[0].test_id);
          this.message.showSuccess('Schedule test added successfully.');
          this.notificationModel.notificationDate = this.testModel.validFrom;
          this.notificationModel.notificationEndDate = this.testModel.validTo;
        }
      },
      (error) => console.log(error)
    );
  }
  //#endregion

  //#region USER

  fileChangeListener($event: any): void {
    // Select the files from the event
    const files = $event.srcElement.files;

    // Parse the file you want to select for the operation along with the configuration
    this.ngxCsvParser
      .parse(files[0], { header: this.header, delimiter: ',' })
      .pipe()
      .subscribe(
        (result: Array<any>) => {
          console.log('Result', result);
          result.forEach((element) => {
            element['Id'] = 0;
            element['CreatedBy'] = this.createdBy;
            element['TestId'] = this.testID;
            this.csvRecords.push(element);
            this.newUsers = this.csvRecords.filter((x) => x.Id == 0);
          });
          //this.csvRecords = result;
        },
        (error: NgxCSVParserError) => {
          console.log('Error', error);
        }
      );
  }

  openModal(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
  }

  public addUsertoArray(): void {
    if (
      this.userModel.Name == null ||
      this.userModel.Name == '' ||
      this.userModel.Phone == null ||
      this.userModel.Phone == '' ||
      this.userModel.Email == null ||
      this.userModel.Email == '' ||
      this.userModel.Address == null ||
      this.userModel.Address == ''
    ) {
      this.message.showError('All mandatory(*) fields are required .');
      return;
    }
    this.userModel.TestId = this.testID;
    this.csvRecords.push(this.userModel);
    this.newUsers = this.csvRecords.filter((x) => x.Id == 0);
    this.userModel = {
      Name: null,
      Phone: null,
      Email: null,
      Address: null,
      CreatedBy: this.createdBy,
      Id: 0,
      TestId: this.testID,
    };
    this.modalRef.hide();
  }

  copy() {
    this._clipboardService.copy(this.testModel.url);
    this.message.showSuccess('Url copied to clipboard');
  }

  insertUsers(): void {
    this.showFileUpload = false;
    setTimeout(() => {
      this.showFileUpload = true;
    }, 10);
    var records = this.csvRecords.filter((x) => x.Id == 0);
    this.http.postData('/api/scheduletest/AddBulkUsers', records).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.newUsers = [];
          this.message.showSuccess('Users added successfully.');
          this.getScheduleTestUsers();
        }
      },
      (error) => console.log(error)
    );
  }

  getScheduleTestUsers(): void {
    this.showFileUpload = false;
    setTimeout(() => {
      this.showFileUpload = true;
    }, 10);
    this.csvRecords = [];
    const testId = localStorage.getItem('secheduledTestId');
    const params = {
      query: `Call RN_SCHEDULE_TEST_USERS_GET(${this.testID})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          var response =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          response.forEach((element) => {
            this.csvRecords.push({
              Name: element.NAME,
              Phone: element.PHONE,
              Email: element.EMAIL,
              Address: element.ADDRESS,
              CreatedBy: element.CREATED_BY,
              Id: element.ID,
              TestId: this.testID,
            });
          });
        }
      },
      (error) => console.log(error)
    );
  }

  deleteScheduleTestUser(id, idx): void {
    const params = {
      query: `Call RN_SCHEDULE_TEST_USER_DELETE(${id})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.csvRecords.splice(idx, 1);
          this.message.showSuccess('User removed successfully.');
        }
      },
      (error) => console.log(error)
    );
  }

  public removeUser(index): void {
    this.csvRecords.splice(index, 1);
    this.newUsers = this.csvRecords.filter((x) => x.Id == 0);

    this.message.showSuccess('User removed successfully.');
  }
  //#endregion
  //#region Notification tabs
  activeSchedule(): void {
    if (
      this.notificationModel.notificationDate == null ||
      this.notificationModel.notificationDate == ''
    ) {
      this.message.showError('All mandatory(*) fields are required.');
      return;
    }
    if (
      this.notificationModel.sendNotification == true &&
      (this.notificationModel.reminderDays == null ||
        this.notificationModel.reminderDays == '' ||
        this.notificationModel.notificationEndDate == null ||
        this.notificationModel.notificationEndDate == '')
    ) {
      this.message.showError('All mandatory(*) fields are required.');
      return;
    }
    const params = {
      query: `Call RN_SCHEDULE_NOTIFICATION_INSERT('${this.notificationModel.notificationDate.year}-${this.notificationModel.notificationDate.month}-${this.notificationModel.notificationDate.day}','${this.notificationModel.notificationEndDate.year}-${this.notificationModel.notificationEndDate.month}-${this.notificationModel.notificationEndDate.day}','${this.notificationModel.reminderDays}','${this.createdBy}','${this.testID}',${this.notificationModel.sendNotification})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.message.showSuccess('Schedule active successfully.');
        }
      },
      (error) => console.log(error)
    );
  }

  getActiveNotification(): void {
    const params = {
      query: `Call RN_SCHEDULE_NOTIFICATION_GET('${this.testID}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          var testData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          const _startDate = testData[0].START_DATE.split('-');
          var startDate = {
            year: +_startDate[0],
            month: +_startDate[1],
            day: +_startDate[2].split('T')[0],
          };

          const _endDate = testData[0].END_DATE.split('-');
          var endDate = {
            year: +_endDate[0],
            month: +_endDate[1],
            day: +_endDate[2].split('T')[0],
          };
          this.notificationModel = {
            notificationDate: startDate,
            notificationEndDate: endDate,
            reminderDays: testData[0].REMINDER_DAYS,
            testId: this.testID,
            sendNotification: testData[0].IS_REMINDER,
          };
        }
      },
      (error) => console.log(error)
    );
  }

  public onNotificationDateSelected(): void {
    this.notificationModel.notificationEndDate = null;
  }

  public onDateFromSelected(): void {
    this.testModel.validTo = null;
  }

  keydown(e) {
    if (
      !(
        (e.keyCode > 95 && e.keyCode < 106) ||
        (e.keyCode > 47 && e.keyCode < 58) ||
        e.keyCode == 8
      )
    ) {
      return false;
    }
  }
  //#endregion
}
