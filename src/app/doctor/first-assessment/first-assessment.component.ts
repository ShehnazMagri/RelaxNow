import { Subscription } from 'rxjs';
import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { ApiUrl } from 'src/app/core/apiUrl';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgForm } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { HtmlCharService } from 'src/app/htmchar-service.service';

@Component({
  selector: 'app-first-assessment',
  templateUrl: './first-assessment.component.html',
  styleUrls: ['./first-assessment.component.css'],
})
export class FirstAssessmentComponent implements OnInit, OnDestroy {
  firstAssessmentId = 0;
  patientId;
  appointmentId;
  userSubscription: Subscription;
  modalRef: BsModalRef;
  userRole;
  userData;
  userId;
  patient;
  informantsDropDown = [];
  reliabilityData = [];
  informatData = [];
  axisRecords = [];
  diagnosedAxisData1 = [];
  diagnosedAxisData2 = [];
  diagnosedAxisData3 = [];
  diagnosedAxisData4 = [];
  selectedInformant = '0';
  selectedReliability = '0';
  axis1 = '';
  axis2 = '';
  axis3 = '';
  axis4 = '';
  axisRel1 = '';
  axisRel2 = '';
  axisRel3 = '';
  axisRel4 = '';
  axisOther1 = '';
  axisOther2 = '';
  axisOther4 = '';
  axisAllData = [];
  isSubmitted = false;
  counselingNote = '';
  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'Doctor';
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['undo', 'redo', 'subscript', 'superscript', 'indent', 'outdent'],
      [
        'backgroundColor',
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode',
      ],
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };
  diagnosisName = '';
  diagnosistId = '0';
  removeInf;
  isAxis = false;
  isCompleted = false;
  isVisitor = false;
  appointment: any = [];

  constructor(
    private http: HttpService,
    private user: UserService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private message: MessageService,
    private htmlCharService: HtmlCharService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params.id;
    this.appointmentId = this.route.snapshot.params.appointment_id;
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          this.userRole = userData.result[0].ROLE;
          this.userData = userData.result[0];
          this.userId = userData.result[0].USERID;
          this.isVisitor = !!this.userData.IS_VISITOR;
        }
      }
    );
    Promise.all([
      this.getAppointmentDetails(),
      this.getPatientDetails(this.patientId),
      this.getInformantDropDown(),
      this.getReliabilityDropDown(),
      this.getDiagnosedAxisDropDown(),
      this.getAssessmentId(),
      this.getAxisRecord(),
    ]);
  }

  getAppointmentDetails(): void {
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
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getAssessmentId(): void {
    const params = {
      query: `Call RN_FIRST_ASSESMENT_GET(${this.appointmentId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (
            resp.data &&
            resp.data[0] &&
            resp.data[0].result &&
            resp.data[0].result.length
          ) {
            const data = resp.data[0].result ? resp.data[0].result[0] : [];
            this.firstAssessmentId = data && data.ID ? data.ID : 0;
            this.counselingNote = data && data.NOTES ? data.NOTES : '';
            this.counselingNote = this.htmlCharService.decodeHtmlCharCodes(
              this.counselingNote
            );
            this.modifiedBy = data.AuthenticatedBy;
          }
          this.isCompleted = false;
          this.startEditing();
          if (this.firstAssessmentId) {
            this.getInformantsRecord();
          }
        }
      },
      (error) => console.log(error)
    );
  }

  getPatientDetails(id) {
    const params = {
      query: `Call RN_CUSTOMER_GET_BY_ID(${id})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.patient = data[0];
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getInformantDropDown(): void {
    const params = {
      query: `Call RN_GET_INFORMATION()`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.informantsDropDown = data;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getReliabilityDropDown(): void {
    const params = {
      query: `Call RN_GET_INFORMATIONRELIABILITY()`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.reliabilityData = data;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  getInformantsRecord(): void {
    const params = {
      query: `Call GET_FIRST_ASSESMENT_DETAILS(${this.firstAssessmentId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.informatData = data;
        }
      },
      (error) => console.log(error)
    );
  }
  getAxisRecord(): void {
    const params = {
      query: `Call RN_CUSTOMER_DIAGNOSIS_AXIS_GET(${this.firstAssessmentId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.axisRecords = data.filter((v) => {
            if (v.Active) {
              v['diagnosed'] = this.getNameFromArray(
                this.axisAllData,
                v.DIAGNOSIS_ID
              );
              return v;
            }
          });
        }
      },
      (error) => console.log(error)
    );
  }

  getDiagnosedAxisDropDown(): void {
    const params = {
      query: `Call RN_GET_LIST_OF_DIAGNOSED_WITH_AXIS()`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.axisAllData = data.sort((a, b) => {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          });
          const diagnosisData = this.groupBy(data, 'DiagnosedGroup');
          debugger;
          this.diagnosedAxisData1 = diagnosisData.Axis1
            ? diagnosisData.Axis1
            : [];

          this.diagnosedAxisData1 = this.diagnosedAxisData1.sort((a, b) => {
            if (a.Codes < b.Codes) {
              return -1;
            }
            if (a.Codes > b.Codes) {
              return 1;
            }
            return 0;
          });
          this.diagnosedAxisData2 = diagnosisData.Axis2
            ? diagnosisData.Axis2
            : [];
          this.diagnosedAxisData3 = diagnosisData.Axis3
            ? diagnosisData.Axis3
            : [];
          this.diagnosedAxisData4 = diagnosisData.Axis4
            ? diagnosisData.Axis4
            : [];
          if (this.firstAssessmentId) {
            this.getAxisRecord();
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  saveInformant(form: NgForm): void {
    var informantCount = this.informatData.filter(
      (x) =>
        x.ReliabilityId == this.selectedReliability &&
        x.InformantId == this.selectedInformant
    );
    if (informantCount.length > 0) {
      this.message.showError('Informant info is already available');
      return;
    }
    this.isSubmitted = true;
    if (!form.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    const params = {
      query: `Call RN_CUSTOMER_INFORMENT_INSERT(${this.patientId},${this.selectedInformant},${this.selectedReliability},1,'','${this.userId}',${this.firstAssessmentId},0)`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.getInformantsRecord();
        }
      },
      (error) => console.log(error)
    );
  }
  submitAssessment(): void {
    if (
      !this.counselingNote &&
      !this.informatData.length &&
      !this.axisRecords.length
    ) {
      this.message.showError('Please add some data to submit the assessment');
      return;
    }
    const params = {
      vAPPOINTMENT_ID: this.appointmentId,
      vNOTES: this.htmlCharService.HtmlEncode(this.counselingNote),
      vId: this.firstAssessmentId,
      vStatus: 'COMPLETED',
    };
    this.http.postData(ApiUrl.completeAssessment, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.isCompleted = true;
          this.appointment.FSTATUS = 'COMPLETED';
          this.message.showSuccess('Assessment Completed Successfully!');
        }
      },
      (error) => console.log(error)
    );
  }

  startEditing(): void {
    const params = {
      query: `Call RN_FIRST_ASSESMENT_INSERT(${
        this.appointmentId
      },'${this.htmlCharService.HtmlEncode(this.counselingNote)}',${
        this.userId
      },${this.firstAssessmentId},'EDITING')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result[0].ID : 0;
          this.firstAssessmentId = data;
          this.getAppointmentDetails();
        }
      },
      (error) => console.log(error)
    );
  }
  saveNotes(): void {
    if (!this.counselingNote) {
      this.message.showError('Please enter some text to save');
      return;
    }

    const params = {
      query: `Call RN_FIRST_ASSESMENT_INSERT(${
        this.appointmentId
      },'${this.htmlCharService.HtmlEncode(this.counselingNote)}',${
        this.userId
      },${this.firstAssessmentId},'EDITING')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result[0].ID : 0;
          this.firstAssessmentId = data;
          if (this.firstAssessmentId) {
            this.message.showSuccess('Assessment notes added successfully.');
            this.getInformantsRecord();
          }
        }
      },
      (error) => console.log(error)
    );
  }

  saveAxis(axis, rel, parentId): void {
    debugger;
    if (!axis) {
      this.message.showError('Please select axis!');
      return;
    }
    const params = {
      query: `Call RN_CUSTOMER_DIAGNOSIS_AXIS_INSERT_UPDATE(${this.patientId},${parentId},${axis},'${rel}','',${this.userId},${this.firstAssessmentId},1,0)`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.getAxisRecord();
          if (parentId == '0') {
            this.axis1 = '';
            this.axisRel1 = '';
          } else if (parentId == '1') {
            this.axis2 = '';
            this.axisRel2 = '';
          } else if (parentId == '2') {
            this.axis3 = '';
            this.axisRel3 = '';
          } else {
            this.axis4 = '';
            this.axisRel4 = '';
          }
        }
      },
      (error) => console.log(error)
    );
  }

  deleteInformant(): void {
    if (!this.removeInf) {
      this.message.showError('Not able to remove try again!');
      return;
    }
    let params = {};
    if (this.isAxis) {
      params = {
        query: `Call RN_CUSTOMER_DIAGNOSIS_AXIS_INSERT_UPDATE(${this.patientId},${this.removeInf.AXIS_ID},${this.removeInf.DIAGNOSIS_ID},',${this.removeInf.VALUE}','',${this.userId},${this.firstAssessmentId},0,${this.removeInf.ID})`,
        params: '',
      };
    } else {
      params = {
        query: `Call RN_CUSTOMER_INFORMANT_DELTE(${this.removeInf.CustomerInformantID})`,
        params: '',
      };
    }
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        this.modalRef.hide();
        if (!!resp) {
          if (this.isAxis) {
            this.getAxisRecord();
          } else {
            this.getInformantsRecord();
          }
          this.removeInf = null;
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Open Add Modal ***/
  openModal(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
    this.diagnosisName = '';
    this.diagnosistId = '0';
  }
  /*** Open Delete Modal ***/
  deleteModal(template: TemplateRef<any>, data, isAxis = false): void {
    this.removeInf = data;
    this.isAxis = isAxis;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
  }
  /*** Cancel Delete ***/
  decline(): void {
    this.modalRef.hide();
    this.removeInf = null;
  }
  /*** Add Daignoisi ***/
  addDiagnosis(form: NgForm): void {
    debugger;
    this.isSubmitted = true;
    if (!form.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }

    const params = {
      query: `Call RN_DIAGNOSED_INSERT(${this.diagnosistId},'${this.diagnosisName}','')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const id =
            resp.data && resp.data[0].result ? resp.data[0].result[0].ID : 0;

          this.getDiagnosedAxisDropDown();
          this.axis1 = '';
          this.axis2 = '';
          this.axis3 = '';
          this.axis4 = '';
          if (id && +this.diagnosistId === 1) {
            this.axis2 = id;
          } else if (id && +this.diagnosistId === 2) {
            this.axis3 = id;
          } else if (id && +this.diagnosistId === 3) {
            this.axis4 = id;
          } else {
            this.axis1 = id;
          }
          this.message.showSuccess('Axis added successfully!');

          this.modalRef.hide();
        }
      },
      (error) => console.log(error)
    );
  }

  /*** ***/
  groupBy(objectArray, property) {
    return objectArray.reduce((rv, x) => {
      (rv[x[property]] = rv[x[property]] || []).push(x);
      return rv;
    }, {});
  }

  /*** Add Daignoisi ***/
  getNameFromArray(array, id): string {
    const item = array.find((x) => +x.Id === +id || +x.id === +id);
    if (item) {
      return item.Name || item.name;
    }
    return '';
  }

  videoCall(): void {
    localStorage.setItem(
      'call_room',
      this.appointment.DOCTOR_FIRST_NAME +
        '' +
        this.appointment.DOCTOR_LAST_NAME
    );
    const params = {
      ToUserId: `${this.appointment.CUSTOMER_ID}`,
      UserType: 'P',
      Room: `${
        this.appointment.DOCTOR_FIRST_NAME +
        '' +
        this.appointment.DOCTOR_LAST_NAME
      }`,
      appointmentId: `${this.appointment.RN_APPOINTMENT_ID}`,
      CallerId: `${this.appointment.DOCTOR_ID}`,
      CallerType: 'D',
    };
    this.http.postData(ApiUrl.notifyUser, params).subscribe((resp) => {
      this.router.navigate(['/doctor/chat-portal', this.appointmentId]);
    });
  }
  /*** Intiate User Call ***/
  callUser(): void {
    const user = {
      name: this.patient.FIRST_NAME + ' ' + this.patient.LAST_NAME,
      image: this.patient.ImageBase64,
      userType: 0,
      mobile: this.patient.MOBILE,
    };
    this.user.setCallUser(user);
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
