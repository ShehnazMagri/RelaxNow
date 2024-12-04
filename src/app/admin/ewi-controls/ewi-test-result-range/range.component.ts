import { NullTemplateVisitor } from '@angular/compiler';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { DataTableDirective } from 'angular-datatables';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { HtmlCharService } from 'src/app/htmchar-service.service';
const specialChars = new RegExp(/[&\/\|()\$~%\'\":\*\?<>{}\!]/g);

@Component({
  selector: 'app-ewi-test-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.css'],
})
export class EwiTestRangeComponent implements OnInit, AfterViewInit, OnDestroy {
  rangeData = [];
  testData = [];
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Mada',
    fonts: [{ class: 'Mada', name: 'Mada' }],
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
  };
  modalRef: BsModalRef;
  isSubmitted = false;
  rangeDataModel = {
    ID: 0,
    TEST_ID: null,
    RESULT_TERM: null,
    MIN_VALUE: null,
    MAX_VALUE: null,
    RESULT_DESCRIPTION: null,
    ACTIVE: 1,
    COLOR: null,
    SMILEY: null,
    Consultation: null,
    Recommendations: null,
  };

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
    this.getTestRangeList();
    this.getTestList();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  getTestRangeList(): void {
    const params = {
      query: 'Call RN_EWI_TEST_RESULT_RANGE_GET()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.rangeData = result;
          this.rangeDataModel = {
            ID: 0,
            TEST_ID: null,
            RESULT_TERM: null,
            MIN_VALUE: null,
            MAX_VALUE: null,
            RESULT_DESCRIPTION: null,
            ACTIVE: 1,
            COLOR: null,
            SMILEY: null,
            Consultation: null,
            Recommendations: null,
          };
          this.rerender();
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Get Groups Listing ***/
  getTestList(): void {
    const params = {
      query: 'Call RN_EWI_TEST_GET_ACTIVE()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];

          this.testData = result;
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Open Add/Edit Modal ***/
  openModal(template: TemplateRef<any>, rangeDataModel): void {
    this.rangeDataModel = {
      ID: rangeDataModel.ID,
      TEST_ID: rangeDataModel.TEST_ID,
      RESULT_TERM: rangeDataModel.RESULT_TERM,
      MIN_VALUE: rangeDataModel.MIN_VALUE,
      MAX_VALUE: rangeDataModel.MAX_VALUE,
      RESULT_DESCRIPTION: this.htmlCharService.decodeHtmlCharCodes(
        rangeDataModel.RESULT_DESCRIPTION
      ),
      ACTIVE: rangeDataModel.ACTIVE,
      COLOR: rangeDataModel.COLOR,
      SMILEY: rangeDataModel.SMILIES,
      Recommendations: rangeDataModel.Recommendations,
      Consultation: rangeDataModel.Consultation,
    };
    this.isSubmitted = false;

    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
  }

  /*** Open Delete Modal ***/
  deleteModal(template: TemplateRef<any>, Answer): void {
    this.rangeDataModel = Answer;
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
    this.save();
  }

  /*** Insert/Save Data ***/
  save(): void {
    this.rangeDataModel.RESULT_DESCRIPTION = this.htmlCharService.HtmlEncode(
      this.rangeDataModel.RESULT_DESCRIPTION
    );
    const params = {
      query: `Call RN_EWI_TEST_RESULT_RANGE_INSERT('${this.rangeDataModel.ID}','${this.rangeDataModel.TEST_ID}',
      '${this.rangeDataModel.RESULT_TERM}',
      '${this.rangeDataModel.MIN_VALUE}',
      '${this.rangeDataModel.MAX_VALUE}',
      '${this.rangeDataModel.RESULT_DESCRIPTION}',
      '${this.rangeDataModel.ACTIVE}',
      '${this.rangeDataModel.COLOR}',
      '${this.rangeDataModel.SMILEY}','${this.rangeDataModel.Recommendations}',
      '${this.rangeDataModel.Consultation}')`,
      params: '',
    };
    this.executeRequestDelete(params, 'save');
    this.modalRef.hide();
    this.isSubmitted = false;
  }

  /*** Execute Procedular query  ***/
  executeRequest(params: any): void {
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.getTestRangeList();
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
            this.getTestRangeList();
            this.msg.showSuccess('Test result range saved successfully!');
          }
          if (type === 'update') {
            this.getTestRangeList();
            this.msg.showSuccess('Test result range updated successfully!');
          }
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Toogle Status ***/
  changeStatus(event: boolean, rangeData): void {
    rangeData.RESULT_DESCRIPTION = this.htmlCharService.decodeHtmlCharCodes(
      rangeData.RESULT_DESCRIPTION
    );
    const params = {
      query: `Call RN_EWI_TEST_RESULT_RANGE_INSERT('${rangeData.ID}','${
        rangeData.TEST_ID
      }',
    '${rangeData.RESULT_TERM}',
    '${rangeData.MIN_VALUE}',
    '${rangeData.MAX_VALUE}',
    '${rangeData.RESULT_DESCRIPTION}',
    '${+event}',
    '${rangeData.COLOR}',
    '${rangeData.SMILEY}','${this.rangeDataModel.Recommendations}',
      '${this.rangeDataModel.Consultation}')`,
      params: '',
    };
    this.msg.confirm('Change Status').then((data) => {
      if (data.value) {
        this.executeRequestDelete(params, 'update');
      } else {
        this.getTestRangeList();
      }
    });
  }

  // /*** Confirm Delete ***/
  // deleteAnswer(): void {
  //   const params = {
  //     query: `Call RN_EWI_GROUP_ANSWERS_DELETE(${this.rangeDataModel.ID})`,
  //     params: '',
  //   };

  //   for (var i = 0; i < this.testData.length; i++) {
  //     var obj = this.testData[i];

  //     if (this.testData.indexOf(obj.id) !== -1) {
  //       this.testData.splice(i, 1);
  //     }
  //   }
  //   // this.executeRequest(params);
  //   this.modalRef.hide();
  // }

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

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
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

  selectSmiley(name) {
    this.rangeDataModel.SMILEY = name;
  }
}
