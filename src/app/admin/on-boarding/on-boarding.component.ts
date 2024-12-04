import { MessageService } from 'src/app/core/services/message/message.service';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { OnBoardingModel } from './on-boarding.model';
const now = new Date();

@Component({
  selector: 'app-on-boarding',
  templateUrl: './on-boarding.component.html',
  styleUrls: ['./on-boarding.component.css'],
})
export class OnBoardingComponent implements OnInit, AfterViewInit, OnDestroy {
  peopleData = [];
  genderData = [];
  categoryData = [];
  incomeData = [];
  maritalStatusData = [];
  countryData = [];
  roleData = [];
  modalRef: BsModalRef;
  isSubmitted = false;
  selectedPeople: OnBoardingModel = new OnBoardingModel();

  // Datatable Options
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = { order: [] };
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'admin';
  currentDate = moment().startOf('day').subtract(18, 'years');
  birthDate = {
    year: +this.currentDate.format('YYYY'),
    month: +this.currentDate.format('MM'),
    day: +this.currentDate.format('DD'),
  };

  maxDate = {
    year: +this.currentDate.format('YYYY'),
    month: +this.currentDate.format('MM'),
    day: +this.currentDate.format('DD'),
  };
  enableCheck = false;

  stateId = 0;
  cityId = 0;
  states = [];
  cities = [];

  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    debugger;
    console.log(this.birthDate);
    this.getCategoryList();
    this.getGenderList();
    this.getIncomeList();
    this.getMaritalStatusList();
    this.getCountryList();
    this.getRoleList();

    this.getPeopleList();
    this.getState();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  checkVisitor(role): void {
    if (+role === 2) {
      this.enableCheck = true;
    } else {
      this.enableCheck = false;
    }
  }

  rerender(): void {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again
        this.dtTrigger.next();
      });
    }
  }

  getPeopleList(): void {
    const params = {
      query: "Call RN_PEOPLE_GET('',1)",
      params: '',
    };

    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.peopleData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.rerender();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getGenderList(): void {
    const params = {
      query: 'Call RN_GENDER_GETALL()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.genderData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
        }
      },
      (error) => console.log(error)
    );
  }

  getCountryList(): void {
    const params = {
      query: 'Call RN_COUNTRY_GETALL()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.countryData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
        }
      },
      (error) => console.log(error)
    );
  }

  getRoleList(): void {
    const params = {
      query: 'Call RN_Role_GETALL()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.roleData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getMaritalStatusList(): void {
    const params = {
      query: 'Call RN_MARITAL_STATUS_GETALL()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.maritalStatusData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
        }
      },
      (error) => console.log(error)
    );
  }

  getCategoryList(): void {
    const params = {
      query: 'Call RN_CATEGORY_GETALL()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.categoryData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
        }
      },
      (error) => console.log(error)
    );
  }

  getIncomeList(): void {
    const params = {
      query: 'Call RN_MONTHLY_INCOME_GETALL()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.incomeData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          console.log(this.incomeData);
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Toogle Status ***/
  changeStatus(event: boolean, people: OnBoardingModel): void {
    const params = {
      query: `Call RN_PEOPLE_UPDATE_STATUS(${people.ID},${+event})`,
      params: '',
    };
    this.message.confirm('Change Status').then((data) => {
      if (data.value) {
        this.executeRequest(params);
      } else {
        this.getPeopleList();
      }
    });
  }

  /*** Insert/Update Data ***/
  save(form: NgForm): void {
    this.isSubmitted = true;
    if (!form.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    const DOB =
      this.birthDate['year'] +
      '-' +
      (this.birthDate['month'] < 10
        ? '0' + this.birthDate['month']
        : this.birthDate['month']) +
      '-' +
      (this.birthDate['day'] < 10
        ? '0' + this.birthDate['day']
        : this.birthDate['day']);
    let query;
    debugger;
    if (this.selectedPeople.ID > 0) {
      query = `Call RN_PEOPLE_UPDATE(${this.selectedPeople.ID},'${this.selectedPeople.RELATIONSHIP_NUMBER}','${this.selectedPeople.Prefix}','${this.selectedPeople.FIRST_NAME}','${this.selectedPeople.MIDDLE_NAME}','${this.selectedPeople.LAST_NAME}','${this.selectedPeople.CATEGORY_ID}','${this.selectedPeople.GUARDIAN_NAME}','${DOB}','${this.selectedPeople.UID_NUMBER}',${this.selectedPeople.GENDER_ID},${this.selectedPeople.MARITAL_STATUS_ID},${this.selectedPeople.CITIZEN_COUNTRY_ID},${this.selectedPeople.MONTHLY_INCOME},'${this.selectedPeople.OCCUPATION}','${this.modifiedBy}',${this.selectedPeople.Mobile},'${this.selectedPeople.EMAIL}','${this.selectedPeople.ADDRESS}',${this.selectedPeople.ROLEID},'${this.selectedPeople.IDENTIFICATION_NUMBER}',${this.selectedPeople.ACTIVE},${this.selectedPeople.IS_VISITOR},${this.selectedPeople.STATE},${this.selectedPeople.CITY})`;
    } else {
      query = `Call RN_PEOPLE_INSERT_NEW('${this.selectedPeople.RELATIONSHIP_NUMBER}','${this.selectedPeople.Prefix}','${this.selectedPeople.FIRST_NAME}','${this.selectedPeople.MIDDLE_NAME}','${this.selectedPeople.LAST_NAME}','${this.selectedPeople.CATEGORY_ID}','${this.selectedPeople.GUARDIAN_NAME}','${DOB}','${this.selectedPeople.UID_NUMBER}',${this.selectedPeople.GENDER_ID},${this.selectedPeople.MARITAL_STATUS_ID},${this.selectedPeople.CITIZEN_COUNTRY_ID},${this.selectedPeople.MONTHLY_INCOME},'${this.selectedPeople.OCCUPATION}','${this.modifiedBy}','${this.selectedPeople.Mobile}','${this.selectedPeople.EMAIL}','${this.selectedPeople.ADDRESS}',${this.selectedPeople.ROLEID},'${this.selectedPeople.IDENTIFICATION_NUMBER}',${this.selectedPeople.IS_VISITOR},${this.selectedPeople.STATE},${this.selectedPeople.CITY})`;
    }
    const params = {
      query,
      params: '',
    };
    this.executeRequest(params);

    this.isSubmitted = false;
  }
  /*** Confirm Delete ***/
  deletePeople(): void {
    const params = {
      query: `Call RN_PEOPLE_DELETE(${this.selectedPeople.ID})`,
      params: '',
    };
    this.executeRequest(params);
    this.modalRef.hide();
  }

  /*** Cancel Delete ***/
  decline() {
    this.modalRef.hide();
  }
  /*** Execute Procedular query  ***/
  executeRequest(params: any): void {
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (resp.data[0].result[0].ID == -1) {
            this.message.showError('Email Id already exists.');
            return;
          }
          if (resp.data[0].result[0].ID == -2) {
            this.message.showError('Phone number already exists.');
            return;
          }
          this.message.showSuccess('Member added successfully.');
          this.modalRef.hide();
          this.getPeopleList();
          if (this.selectedPeople.ID == 0) {
            this.sendOnBoardingMail();
          }
        }
      },
      (error) => console.log(error)
    );
  }

  openModal(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
    this.selectedPeople = new OnBoardingModel();
  }

  editModal(template: TemplateRef<any>, people: OnBoardingModel): void {
    if (people != null) {
      this.selectedPeople = people;
      this.getCity(this.selectedPeople.STATE);
      const dateOfBirth = people.DOB.split('-');
      this.birthDate = {
        year: +dateOfBirth[0],
        month: +dateOfBirth[1],
        day: +dateOfBirth[2],
      };
    } else {
      this.selectedPeople = new OnBoardingModel();
    }

    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
      backdrop: 'static',
    });
  }

  deleteModal(template: TemplateRef<any>, people: OnBoardingModel): void {
    this.selectedPeople = people;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
  }

  updateOrder(sp, item): void {
    const params = {
      query: `Call ${sp}(${item.Order_By},${item.ID})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.getPeopleList();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  sendOnBoardingMail(): void {
    const params = {
      Template_Name: 'ONBOARDING_EMAIL',
      Patient_Name: this.selectedPeople.FIRST_NAME,
      Email: this.selectedPeople.EMAIL,
    };
    this.http.postData(ApiUrl.email, params).subscribe((resp: any) => {
      if (!!resp) {
        this.message
          .defaultUsernamePassword(this.selectedPeople.Mobile, 'Welcome@123')
          .then((data) => {
            if (data.value) {
            } else {
            }
          });
      }
    });
  }

   /*** Get Groups Listing ***/
   getState(): void {
    const params = {
      query: null
    };
    this.http.postData('/api/get-states', params).subscribe(
      (resp: any) => {
        if (!!resp) {
          debugger;
          const result =resp.data[0];
          this.states = result;
        }
      },
      (error) => console.log(error)
    );
  }

  getCity(cityId): void {
    debugger;
    const params = {
      id: cityId,
    };
    this.http.postData('/api/get-cities', params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =resp.data[0];
          this.cities = result;
        }
      },
      (error) => console.log(error)
    );
  }
}
