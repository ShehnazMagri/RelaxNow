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
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { GroupModel } from './ewi-groups.model';

@Component({
  selector: 'app-ewi-groups',
  templateUrl: './ewi-groups.component.html',
  styleUrls: ['./ewi-groups.component.css'],
})
export class EwiGroupsComponent implements OnInit, AfterViewInit, OnDestroy {
  groupData: Array<GroupModel> = [];
  modalRef: BsModalRef;
  isSubmitted = false;
  selectedGroup: GroupModel = new GroupModel();

  // Datatable Options
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'admin';

  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private msg: MessageService
  ) {}

  ngOnInit(): void {
    this.getGroupList();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  /*** Get Groups Listing ***/
  getGroupList(): void {
    const params = {
      query: 'Call RN_EWIT_GETGROUP()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.groupData = result;
          // .filter((v) => {
          //   if (v.ACTIVE) { return v; }
          // });
          this.rerender();
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Open Add/Edit Modal ***/
  openModal(
    template: TemplateRef<any>,
    Group: GroupModel = new GroupModel()
  ): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
    this.isSubmitted = false;
    this.selectedGroup = Group;
  }

  /*** Open Delete Modal ***/
  deleteModal(template: TemplateRef<any>, Group: GroupModel): void {
    this.selectedGroup = Group;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
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
    if (this.selectedGroup.ID) {
      this.update();
    } else {
      this.save();
    }
  }

  /*** Insert/Save Data ***/
  save(): void {
    const params = {
      query: `Call RN_EWI_GROUP_INSERT('${this.selectedGroup.NAME}','${this.modifiedBy}')`,
      params: '',
    };
    this.executeRequestDelete(params, 'save');
    this.modalRef.hide();
    this.isSubmitted = false;
  }

  /*** Update Data ***/
  update(): void {
    const params = {
      query: `Call RN_EWI_GROUP_UPDATE(${this.selectedGroup.ID},'${this.selectedGroup.NAME}','${this.modifiedBy}',${this.selectedGroup.ACTIVE})`,
      params: '',
    };

    this.executeRequestDelete(params, 'update');
    this.modalRef.hide();
    this.isSubmitted = false;
  }

  /*** Toogle Status ***/
  changeStatus(event: boolean, group: GroupModel): void {
    const params = {
      query: `Call RN_EWI_GROUP_UPDATE(${group.ID},'${group.NAME}','${
        this.modifiedBy
      }',${+event})`,
      params: '',
    };
    this.msg.confirm('Change Status').then((data) => {
      if (data.value) {
        this.executeRequestDelete(params, 'update');
      } else {
        this.getGroupList();
      }
    });
  }

  /*** Execute Procedular query  ***/
  executeRequest(params: any): void {
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.getGroupList();
        }
      },
      (error) => console.log(error)
    );
  }

  executeRequestDelete(params: any, type: string = ''): void {
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (type === 'save') {
            this.getGroupList();
            this.msg.showSuccess('Group saved successfully!');
          }
          if (type === 'update') {
            this.getGroupList();
            this.msg.showSuccess('Group updated successfully!');
          }
        }
      },
      (error) => console.log(error)
    );
  }
  /*** Confirm Delete ***/
  deleteGroup(): void {
    const params = {
      query: `Call RN_EWI_GROUP_DELETE(${this.selectedGroup.ID})`,
      params: '',
    };

    this.executeRequestDelete(params);
    for (var i = 0; i < this.groupData.length; i++) {
      var obj = this.groupData[i];

      if (obj.ID == obj.ID) {
        this.groupData.splice(i, 1);
      }
    }
    this.modalRef.hide();
  }

  /*** Cancel Delete ***/
  decline() {
    this.modalRef.hide();
  }

  /*** Re-render Datatable ***/
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

  /*** UnSubscribe the events to prevent memory leakage ***/
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
