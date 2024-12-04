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
import { QuestionModel } from './ewi-questions.model';

@Component({
  selector: 'app-ewi-questions',
  templateUrl: './ewi-questions.component.html',
  styleUrls: ['./ewi-questions.component.css'],
})
export class EwiQuestionsComponent implements OnInit, AfterViewInit, OnDestroy {
  questionData: Array<QuestionModel> = [];
  modalRef: BsModalRef;
  isSubmitted = false;
  selectedQuestion: QuestionModel = new QuestionModel();

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
    this.getQuestionList();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  /*** Get Questions Listing ***/
  getQuestionList(): void {
    const params = {
      query: 'Call RN_EWI_GET_QUESTIONS()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.questionData = result.forEach((v) => {
            v.NAME = this.htmlCharService.decodeHtmlCharCodes(v.NAME);
          });
          this.questionData = result;
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
    Question: QuestionModel = new QuestionModel()
  ): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
    this.isSubmitted = false;
    this.selectedQuestion = Question;
  }

  /*** Open Delete Modal ***/
  deleteModal(template: TemplateRef<any>, Question: QuestionModel): void {
    this.selectedQuestion = Question;
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
    if (this.selectedQuestion.ID) {
      this.update();
    } else {
      this.save();
    }
  }

  /*** Insert/Save Data ***/
  save(): void {
    const params = {
      query: `Call RN_EWI_QUESTIONS_INSERT('${this.htmlCharService.HtmlEncode(
        this.selectedQuestion.NAME
      )}',1,1,'${this.modifiedBy}')`,
      params: '',
    };
    this.executeRequestDelete(params, 'save');
    this.modalRef.hide();
  }

  /*** Update Data ***/
  update(): void {
    const params = {
      query: `Call RN_EWI_QUESTIONS_UPDATE(${this.selectedQuestion.ID},${
        this.selectedQuestion.APPROVAL
      },${this.selectedQuestion.LOCKED},'${this.htmlCharService.HtmlEncode(
        this.selectedQuestion.NAME
      )}','${this.modifiedBy}',${this.selectedQuestion.ACTIVE})`,
      params: '',
    };

    this.executeRequestDelete(params, 'update');
    this.modalRef.hide();
  }

  /*** Toogle Status ***/
  changeStatus(event: boolean, question: QuestionModel): void {
    const params = {
      query: `Call RN_EWI_QUESTIONS_UPDATE(${question.ID},${
        question.APPROVAL
      },1,'${this.htmlCharService.HtmlEncode(question.NAME)}','${
        this.modifiedBy
      }',${+event})`,
      params: '',
    };

    this.msg.confirm('Change Status').then((data) => {
      if (data.value) {
        this.executeRequestDelete(params, 'update');
      } else {
        this.getQuestionList();
      }
    });
  }

  executeRequestDelete(params: any, type: string = ''): void {
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (type === 'save') {
            this.getQuestionList();
            this.msg.showSuccess('Question saved successfully!');
          }
          if (type === 'update') {
            this.getQuestionList();
            this.msg.showSuccess('Question updated successfully!');
          }
        }
      },
      (error) => console.log(error)
    );
  }
  /*** Execute Procedular query  ***/
  executeRequest(params: any): void {
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.getQuestionList();
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Confirm Delete ***/
  deleteQuestion(): void {
    const params = {
      // query: `Call RN_EWI_QUESTIONS_DELETE(${this.selectedQuestion.ID})`,
      query: `Call RN_EWI_QUESTIONS_UPDATE(${this.selectedQuestion.ID},${
        this.selectedQuestion.APPROVAL
      },1,'${this.htmlCharService.HtmlEncode(this.selectedQuestion.NAME)}','${
        this.modifiedBy
      }',0)`,
      params: '',
    };
    this.executeRequest(params);
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
