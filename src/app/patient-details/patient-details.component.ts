import { HtmlCharService } from './../htmchar-service.service';
import { MessageService } from './../core/services/message/message.service';
import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiUrl } from '../core/apiUrl';
import { HttpService } from '../core/services/http/http.service';
import { UserService } from '../core/services/user/user.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgForm } from '@angular/forms';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css'],
})
export class PatientDetailsComponent implements OnInit {
  public reports = [];
  public medicineList = [];
  public userId = 0;
  public suggestionId = 0;
  public refferedCategory = [];
  public refferedConsultant = [];
  public refferedType = [];
  public refferedFrequency = [];
  public refferedHistory = [];
  public referral = {
    category: 0,
    consultant: 0,
    type: 0,
    frequency: 0,
    notes: '',
  };

  public documentsLists = [
    {
      id: 'Investigations (Blood reports, Ultrasound, MRI, CT-Scan, etc.)',
      value: 'Investigations (Blood reports, Ultrasound, MRI, CT-Scan, etc.)',
    },
    {
      id: 'Old Prescriptions',
      value: 'Old Prescriptions',
    },
    {
      id: 'Report of Psychological Assessment',
      value: 'Report of Psychological Assessment',
    },
    {
      id: 'Referral Note',
      value: 'Referral Note',
    },
    {
      id: 'Therapy related document',
      value: 'Therapy related document',
    },
    {
      id: 'Others',
      value: 'Others',
    },
  ];
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
  patient;
  prescription = '';
  notes_type = 1;
  appointmentId = 0;
  patientId = 0;
  prescriptionId = 0;
  domicile = '';
  patientHistory = [];
  suggestionList = [];
  customerSuggestionList = [];
  medication = [];
  userSubscription: Subscription;
  userRole;
  userData;
  selectedPrescId = 0;

  modalRef: BsModalRef;
  fileName = '';
  isSubmitted = false;
  fileData;
  filetoUpload;
  isVisitor = false;
  appointment: any = [];
  newSuggestion = '';
  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private user: UserService,
    private route: ActivatedRoute,
    private message: MessageService,
    private router: Router,
    private htmlCharService: HtmlCharService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params.id;
    this.appointmentId = this.route.snapshot.params.appointment_id
      ? this.route.snapshot.params.appointment_id
      : 0;
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
      this.getPatientDetails(this.patientId),
      this.getPatientPrescriptionDetails(this.patientId),
      this.getAppointmentDetails(),
      this.getPatientReports(),
      this.getMedicineList(),
      this.getSuggestions(),
      this.getSuggestionsForAppointment(),
      this.getReferals(),
    ]);
  }

  public getReferals() {
    this.getRefferedTo();
    this.getReferralHistory();
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

  getRefferedTo() {
    //
    const params = {
      query: `Call RN_REFERRAL_CATEGORY_GET()`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.refferedCategory = data;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getReferralHistory() {
    if (!this.appointmentId || !this.patientId) {
      return;
    }
    const params = {
      query: `Call RN_GET_REFFERED_CUSTOMER_DETAILS( ${this.patientId},${this.appointmentId})`,
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

  getRefferedConsultant() {
    const params = {
      query: `Call RN_REFERRED_CONSULTANT_GET()`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.refferedConsultant = data;
          this.getRefferedType();
          this.getRefferedFrequency();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getRefferedType() {
    //
    const params = {
      query: `Call RN_REFFERED_TYPE_GET()`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.refferedType = data;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getRefferedFrequency() {
    //
    const params = {
      query: `Call RN_REFFERED_FREQUENCY_GET()`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.refferedFrequency = data;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getPatientReports() {
    const params = {
      query: `Call GET_CUSTOMER_TEST_REPORT(${this.patientId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.reports = data;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getMedicineList() {
    const params = {
      query: `Call RN_GET_MEDICINE()`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.medicineList = data;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getSuggestions() {
    const params = {
      query: `Call RN_GET_SUGGESTIONS()`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.suggestionList = data;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  addReferral() {
    // alert(this.referral.category);
    // return;
    if (this.referral.category != 49) {
      if (this.referral.notes.trim() == '' || this.referral.consultant == 0) {
        this.message.showError('All fields are required');
        return;
      }
    }

    if (this.referral.category == 49) {
      if (
        this.referral.consultant == 0 ||
        this.referral.type == 0 ||
        this.referral.frequency == 0
      ) {
        this.message.showError('All fields are required');
        return;
      }
    }
    const params = {
      vREFERRAL_CATEGORY_ID: this.referral.category,
      vREFERRED_CONSULTANT_ID: this.referral.consultant,
      vTYPE_ID: this.referral.type,
      vFREQUENCY_ID: this.referral.frequency,
      vCRETAED_BY: this.userId,
      vCUSTOMER_ID: this.patientId,
      vAPPOINTMENT_ID: this.appointmentId,
      vNotes: this.referral.notes,
    };
    this.http.postData(`/referral/add`, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.message.showSuccess('Referred successfully');
          this.getReferralHistory();
        }
      },
      (error) => {
        console.log(error);
      }
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

  insertSuggestionForAppointment() {
    const suggestionCount = this.customerSuggestionList.filter(
      (x) => +x.SUGGESTION_ID === +this.suggestionId
    );
    if (suggestionCount.length > 0) {
      this.message.showError('Suggestion already available');
      return;
    }
    if (!this.appointmentId) {
      return;
    }
    const params = {
      query: `Call RN_CUSTOMER_APPOINTMENT_SUGGESTIONS_INSERT(${this.appointmentId},${this.patientId},${this.suggestionId},${this.userId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.message.showSuccess('Suggestion Added Successfully');
          this.getSuggestionsForAppointment();
          this.suggestionId = 0;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  deleteSuggestions(id) {
    const params = {
      query: `Call RN_CUSTOMER_APPOINTMENT_SUGGESTIONS_DELETE(${id})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.message.showSuccess('Suggestion Deleted Successfully');
          this.getSuggestionsForAppointment();
          this.suggestionId = 0;
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
          const data =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.patientHistory = data;
          this.groupBy(data, 'PID');
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  InsertMedicationDetails(notes = false) {
    // if (this.prescription == '') {
    //   if (this.userRole == 'Psychiatrist') {
    //     this.message.showError('Prescription Note is required.');
    //   } else {
    //     this.message.showError('Notes is required.');
    //   }

    //   return;
    // }
    if (this.medication.length > 0 && this.userRole === 'Psychiatrist') {
      // if (this.medication.filter((x) => x.Dose.trim() == '').length > 0) {
      //   this.message.showError('Dose is required.');
      //   return;
      // }
      // if (this.medication.filter((x) => x.Duration.trim() == '').length > 0) {
      //   this.message.showError('Duration is required.');
      //   return;
      // }
      // if (this.medication.filter((x) => x.Name.trim() == '').length > 0) {
      //   this.message.showError('Name is required.');
      //   return;
      // }
      // if (this.medication.filter((x) => x.Potency.trim() == '').length > 0) {
      //   this.message.showError('Potency is required.');
      //   return;
      // }
      // if (this.medication.filter((x) => x.POA.trim() == '').length > 0) {
      //   this.message.showError('POA is required.');
      //   return;
      // }
    }
    const params = {
      Appointment_Id: this.appointmentId,
      Notes: this.htmlCharService.HtmlEncode(this.prescription),
      CreatedBy: this.userData.FIRSTNAME + ' ' + this.userData.LASTNAME,
      notes_type: this.notes_type,
      prescriptionId: this.prescriptionId,
      domicile: this.domicile,
      Medication: notes ? [] : this.medication,
    };
    if (notes && this.filetoUpload) {
      this.fileData.Name =
        'Prescription Uploaded By ' +
        this.userData.FIRSTNAME +
        ' ' +
        this.userData.LASTNAME;
      this.http.postData(ApiUrl.uploadFile, this.fileData).subscribe(
        (resp: any) => {
          if (!!resp) {
            this.modalRef.hide();
            this.fileData = null;
            this.filetoUpload = null;
            this.fileName = '';
            this.isSubmitted = false;
            this.message.showSuccess('File uploaded successfully!');
            this.getPatientReports();
          }
        },
        (error) => console.log(error)
      );
    }
    // if (this.selectedPrescId) {
    // } else {
    this.http.postData(ApiUrl.medication, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.getPatientPrescriptionDetails(this.patientId);
          if (this.userRole == 'Psychiatrist') {
            if (this.selectedPrescId) {
              this.prescriptionId = 0;
              this.prescription = '';
              this.message.showSuccess('Prescription Updated Successfully');
            } else {
              this.prescriptionId = resp.data.prescriptionId || 0;
              this.message.showSuccess('Prescription Added Successfully');
            }
          } else {
            this.message.showSuccess('Added Successfully');
          }

          let params2 = {
            Patient_Name: this.patient.FIRST_NAME,
            Email: this.patient.EMAIL,
            Template_Name: 'PRESCRIPTION',
            Dr_Name:
              this.userData.Prefix +
              ' ' +
              this.userData.FIRSTNAME +
              ' ' +
              this.userData.LASTNAME,
            Date_Time: this.appointment.APPOINTMENT_DATE,
            patientId: this.patientId,
            appointmentId: this.appointmentId,
          };
          this.http.postData(ApiUrl.email, params2).subscribe((resp: any) => {
            if (!!resp) {
            }
          });
          this.selectedPrescId = 0;
          this.medication = [];
        }
      },
      (error) => {
        console.log(error);
      }
    );
    //  }
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
          NOTES_TYPE: obj.NOTES_TYPE,
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
  addMedication() {
    this.medication.push({
      Name: '',
      Potency: '',
      Dose: '',
      Duration: '',
      POA: '',
    });
  }

  removeMedication(idx) {
    if (this.medication.length) {
      this.medication = [];
    } else {
      this.medication.splice(1, idx);
    }
  }

  copyPrescription(medicine, el: HTMLElement): void {
    this.prescription = this.htmlCharService.decodeHtmlCharCodes(
      medicine.Notes
    );
    this.medication = [];
    if (
      this.userRole === 'Psychiatrist' &&
      medicine.items &&
      medicine.items.length
    ) {
      medicine.items.forEach((element) => {
        const data = {
          Name: element.Name,
          Potency: element.Potency,
          Dose: element.Dose,
          Duration: element.Duration,
          POA: element.Action,
        };
        this.medication.push(data);
      });
    }
    el.scrollIntoView();
  }

  editPrescription(medicine, el: HTMLElement): void {
    this.prescription = this.htmlCharService.decodeHtmlCharCodes(
      medicine.Notes
    );
    this.notes_type = medicine.NOTES_TYPE;
    this.prescriptionId = medicine.id;
    this.selectedPrescId = medicine.id;
    this.medication = [];
    if (
      this.userRole === 'Psychiatrist' &&
      medicine.items &&
      medicine.items.length
    ) {
      medicine.items.forEach((element) => {
        const data = {
          Name: element.Name,
          Potency: element.Potency,
          Dose: element.Dose,
          Duration: element.Duration,
          POA: element.Action,
        };
        this.medication.push(data);
      });
    }
    el.scrollIntoView();
  }

  /*** On File select ***/
  onFileSelect(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const parts = file.name.split('.');
      // if (file.size / 1024 / 1024 < 5) {
      if (['jpg', 'jpeg', 'pdf', 'png'].includes(parts[parts.length - 1])) {
        const reader: FileReader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = (e: any) => {
          this.fileData = {
            Name: this.fileName,
            userId: this.patientId,
            createdBy: this.userId,
            base64File: e.target.result,
            fileExtension: parts[parts.length - 1],
            creatorUserType: 2,
          };
        };
      } else {
        this.message.showError('Invalid File Type');
      }
    }
  }

  /*** Upload File ***/
  uploadFile(form: NgForm): void {
    this.isSubmitted = true;
    if (!form.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    if (!this.fileData) {
      this.message.showError('Please choose a valid file');
      return;
    }
    this.fileData.Name = this.fileName;
    this.http.postData(ApiUrl.uploadFile, this.fileData).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.modalRef.hide();
          this.fileData = null;
          this.filetoUpload = null;
          this.fileName = '';
          this.isSubmitted = false;
          this.message.showSuccess('File uploaded successfully!');
          this.getPatientReports();
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Open Add/Edit Modal ***/
  openModal(template: TemplateRef<any>): void {
    this.newSuggestion = '';
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
      backdrop: 'static',
    });
  }

  /*** Upload File ***/
  printPrescription(): void {
    this.http
      .postData(ApiUrl.printPrescription, { patientId: this.patientId })
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
      name: this.patient.FIRST_NAME + ' ' + this.patient.LAST_NAME,
      image: this.patient.ImageBase64,
      userType: 0,
      mobile: this.patient.MOBILE,
    };
    this.user.setCallUser(user);
  }

  addNewSuggestion(form: NgForm): void {
    this.isSubmitted = true;
    if (!form.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    const params = {
      query: `Call RN_ADD_NEW_SUGGESTION('${this.newSuggestion}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.modalRef.hide();
          this.newSuggestion = '';
          this.message.showSuccess('New suggestion added successfully!');
          this.getSuggestions();
          this.suggestionId = resp.data[0].result[0].ID;
        }
      },
      (error) => console.log(error)
    );
  }

  createURL(item) {
    console.log(item.RESULT_FILE_BASEURL + item.RESULT_FILE + '#toolbar=0');
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      item.RESULT_FILE_BASEURL + item.RESULT_FILE + '#toolbar=0'
    );
    //Create your URL
    // return your URL
  }
  isPDF(fileName) {
    if (fileName.indexOf('.pdf') > -1) {
      return true;
    }
    return false;
  }

  completeAppointment(): void {
    if (!this.appointmentId) {
      return;
    }
    const params = {
      query: `Call RN_Update_Appointment_Status(${this.appointmentId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.message.showSuccess('Appointment completed successfully!');
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  addChatToAppointment() {
    localStorage.setItem('ChatChannelID', this.patientId.toString());
    this.router.navigateByUrl('/doctor/message');
  }
}
