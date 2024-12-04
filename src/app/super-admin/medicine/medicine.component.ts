import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ClipboardService } from 'ngx-clipboard';
import { Subject } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { HtmlCharService } from 'src/app/htmchar-service.service';
import { CorporateURL } from 'src/app/core/apiUrl';
const now = new Date();
const CryptoJS = require('crypto-js');
@Component({
  selector: 'app-medicine',
  templateUrl: './medicine.component.html',
  styleUrls: ['./medicine.component.css'],
})
export class AdminMedicineComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  modalRef: BsModalRef;
  isSubmitted = false;
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$';
  medicineId = null;
  fromulationGroupData = [];
  code = null;
  public medicneDetails = {
    Id: 0,
    Name: '',
    ChemicalFormulationGroupId: null,
    medicineGroupId: null,
    Description: null,
  };
  listData: any;
  medicineList: any;
  currentDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  public hideQuestionsScreen = false;
  // Datatable Options
  dtTrigger1: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'admin';

  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private msg: MessageService,
    private htmlCharService: HtmlCharService,
    private route: ActivatedRoute,
    private _clipboardService: ClipboardService,
    private message: MessageService
  ) {}
  ngOnDestroy(): void {
    this.dtTrigger1.unsubscribe();
  }

  ngOnInit(): void {
    this.getMedicine();
    this.getMedicineGroup();
    this.getFormulationGroup();
  }

  rerender(): void {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again
        this.dtTrigger1.next();
      });
    }
  }
  ngAfterViewInit(): void {
    this.dtTrigger1.next();
  }

  getMedicine(): void {
    const params = {
      query: 'Call RN_GET_MEDICINE()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.medicineList =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.rerender();
        }
      },
      (error) => console.log(error)
    );
  }
  /*** Open Add/Edit Modal ***/
  openModal(template: TemplateRef<any>): void {
    this.medicneDetails = {
      Id: 0,
      Name: '',
      ChemicalFormulationGroupId: null,
      medicineGroupId: null,
      Description: null,
    };
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
    this.isSubmitted = false;
  }
  /*** Submit Form ***/
  submitForm(form: NgForm): void {
    this.isSubmitted = true;

    if (!form.valid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 10000);
      return;
    }
    this.addUpdateMedicine();
  }

  getFormulationGroup(): void {
    const params = {
      query: 'Call RN_GET_MEDICINE_CHEMICAL_FORMULATION()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          this.fromulationGroupData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
        }
      },
      (error) => console.log(error)
    );
  }

  getMedicineGroup(): void {
    const params = {
      query: `Call RN_GET_MEDICINE_GROUP()`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.listData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];

          this.rerender();
        }
      },
      (error) => console.log(error)
    );
  }

  addUpdateMedicine() {
    this.modalRef.hide();
    const params = {
      query: `Call RN_INSERT_MEDICINE(${this.medicneDetails.Id},'${this.medicneDetails.Name}',${this.medicneDetails.ChemicalFormulationGroupId},${this.medicneDetails.medicineGroupId},'${this.medicneDetails.Description}')`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          if (this.medicneDetails.Id > 0) {
            this.msg.showSuccess('Medicine updated successfully!');
          } else {
            this.msg.showSuccess('Medicine saved successfully!');
          }
          this.getMedicine();
          this.medicneDetails = {
            Id: 0,
            Name: '',
            ChemicalFormulationGroupId: null,
            medicineGroupId: null,
            Description: null,
          };
          this.modalRef.hide();
        }
      },
      (error) => console.log(error)
    );
  }

  keydown(e) {
    if (
      !(
        (e.keyCode > 95 && e.keyCode < 106) ||
        (e.keyCode > 47 && e.keyCode < 58) ||
        e.keyCode === 8
      )
    ) {
      return false;
    }
  }

  openModalEdit(template: TemplateRef<any>, item): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });

    this.medicneDetails = {
      Id: item.Id,
      Name: item.Name,
      ChemicalFormulationGroupId: item.Formulation_Id,
      medicineGroupId: item.Group_Id,
      Description: item.Description,
    };
    this.isSubmitted = false;
  }

  decline() {
    this.modalRef.hide();
  }

  deleteData() {
    const params = {
      query: `Call RN_DELETE_MEDICINE(${this.medicineId})`,
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.modalRef.hide();
          this.msg.showSuccess('Corporate deleted successfully!');
          this.getMedicine();
        }
      },
      (error) => console.log(error)
    );
  }

  openDeleteModal(template: TemplateRef<any>, id): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
    this.medicineId = id;
  }

  restrictSingleQuote(e) {
    let k;
    document.all ? (k = e.keyCode) : (k = e.which);
    if (k === 39) {
      return false;
    }
  }
}
