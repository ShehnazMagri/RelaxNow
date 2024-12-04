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
import { HtmlCharService } from 'src/app/htmchar-service.service';
import { AnswerModel } from './answer.model';

@Component({
  selector: 'app-ewi-answers',
  templateUrl: './ewi-answers.component.html',
  styleUrls: ['./ewi-answers.component.css'],
})
export class EwiAnswersComponent implements OnInit, AfterViewInit, OnDestroy {
  answerData = [];
  groupData = [];
  modalRef: BsModalRef;
  isSubmitted = false;
  selectedAnswer: AnswerModel = new AnswerModel();
  abc = '';
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
    private msg: MessageService,
    private htmlCharService: HtmlCharService
  ) {}

  ngOnInit(): void {
    this.getAnswerList();
    this.getGroupList();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  /*** Get Answers Listing ***/
  getAnswerList(): void {
    const params = {
      query: 'Call RN_EWI_GET_GROUP_ANSWER()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.answerData = result.map((v) => {
            v.ANSWER = this.htmlCharService.decodeHtmlCharCodes(v.ANSWER);
            return v;
          });
          // .filter((v) => {
          //   if (v.ACTIVE) { return v; }
          // });
          this.rerender();
        }
      },
      (error) => console.log(error)
    );
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

          this.groupData = result.filter((v) => {
            if (v.ACTIVE) {
              return v;
            }
          });
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Open Add/Edit Modal ***/
  openModal(
    template: TemplateRef<any>,
    Answer: AnswerModel = new AnswerModel()
  ): void {
    this.selectedAnswer = Answer;
    this.isSubmitted = false;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
  }

  /*** Open Delete Modal ***/
  deleteModal(template: TemplateRef<any>, Answer: AnswerModel): void {
    this.selectedAnswer = Answer;
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
    if (this.selectedAnswer.ID) {
      this.update();
    } else {
      this.save();
    }
  }

  /*** Insert/Save Data ***/
  save(): void {
    const params = {
      query: `Call RN_EWI_GROUP_ANSWERS_INSERT('${
        this.selectedAnswer.GROUPID
      }','${this.htmlCharService.HtmlEncode(this.selectedAnswer.ANSWER)}','${
        this.selectedAnswer.VALUE
      }','${this.modifiedBy}')`,
      params: '',
    };
    this.executeRequestDelete(params, 'save');
    this.modalRef.hide();
    this.isSubmitted = false;
  }

  /*** Update Data ***/
  update(): void {
    const params = {
      query: `Call RN_EWI_GROUP_ANSWERS_UPDATE(${this.selectedAnswer.ID},'${
        this.selectedAnswer.GROUPID
      }','${this.htmlCharService.HtmlEncode(
        this.selectedAnswer.ANSWER
      )}',${+this.selectedAnswer.VALUE},'${this.modifiedBy}',${+this
        .selectedAnswer.ACTIVE})`,
      params: '',
    };
    this.executeRequestDelete(params, 'update');
    this.modalRef.hide();
    this.isSubmitted = false;
  }

  /*** Execute Procedular query  ***/
  executeRequest(params: any): void {
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.getAnswerList();
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
            this.getAnswerList();
            this.msg.showSuccess('Answer saved successfully!');
          }
          if (type === 'update') {
            this.getAnswerList();
            this.msg.showSuccess('Answer updated successfully!');
          }
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Toogle Status ***/
  changeStatus(event: boolean, answer: AnswerModel): void {
    const params = {
      query: `Call RN_EWI_GROUP_ANSWERS_UPDATE(${answer.ID},'${
        answer.GROUPID
      }','${this.htmlCharService.HtmlEncode(
        answer.ANSWER
      )}',${+answer.VALUE},'${this.modifiedBy}',${+event})`,
      params: '',
    };
    this.msg.confirm('Change Status').then((data) => {
      if (data.value) {
        this.executeRequestDelete(params, 'update');
      } else {
        this.getAnswerList();
      }
    });
  }

  /*** Confirm Delete ***/
  deleteAnswer(): void {
    const params = {
      query: `Call RN_EWI_GROUP_ANSWERS_DELETE(${this.selectedAnswer.ID})`,
      params: '',
    };

    for (var i = 0; i < this.groupData.length; i++) {
      var obj = this.groupData[i];

      if (this.groupData.indexOf(obj.id) !== -1) {
        this.groupData.splice(i, 1);
      }
    }
    // this.executeRequest(params);
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

  /*** Return Group Name by It's Id ***/
  getGroupName(groupId: string): string {
    let groupName = '';
    if (groupId) {
      this.groupData.forEach((v) => {
        if (v.ID.toString() === groupId.toString()) {
          groupName = v.NAME;
        }
      });
    }
    return groupName;
  }
  /*** UnSubscribe the events to prevent memory leakage ***/
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
