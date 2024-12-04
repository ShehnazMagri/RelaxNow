import { MessageService } from './../../../core/services/message/message.service';
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
import { TestModel } from './ewi-test.model';
import { CdkDragDrop, moveItemInArray, CdkDrag } from '@angular/cdk/drag-drop';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { HtmlCharService } from 'src/app/htmchar-service.service';

@Component({
  selector: 'app-ewi-test',
  templateUrl: './ewi-test.component.html',
  styleUrls: ['./ewi-test.component.css'],
})
export class EwiTestComponent implements OnInit, AfterViewInit, OnDestroy {
  testData = [];
  categoryData = [];
  selectedCategory = [];
  modalRef: BsModalRef;
  isSubmitted = false;
  selectedTest: TestModel = new TestModel();

  // Datatable Options
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'admin';

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

  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private msg: MessageService,
    private htmlCharService: HtmlCharService
  ) {}

  ngOnInit(): void {
    this.getCategoryList();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  /*** Get Tests Listing ***/
  getTestList(): void {
    const params = {
      query: 'Call RN_SP_GET_EWI_TEST()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.testData =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.testData.map((v) => {
            v.cat_names = this.getCategoriesName(v.CatID);
            return v;
          });
          this.rerender();
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Get Category Listing ***/
  getCategoryList(): void {
    const params = {
      query: 'Call RN_EWI_GET_CATEGORY()',
      params: '',
    };
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          const result =
            resp.data && resp.data[0].result ? resp.data[0].result : [];
          this.categoryData = result.filter((v) => {
            if (v.ACTIVE) {
              return v;
            }
          });
          this.getTestList();
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Open Add/Edit Modal ***/
  openModal(
    template: TemplateRef<any>,
    test: TestModel = new TestModel()
  ): void {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
    this.selectedCategory = [];
    this.selectedTest = test;
    this.selectedTest.DESCRIPTION = this.htmlCharService.decodeHtmlCharCodes(
      test.DESCRIPTION
    );
    const allcat = test.CatID && test.CatID.length ? test.CatID.split(',') : [];
    this.categoryData.forEach((v) => {
      const index = allcat.indexOf(v.ID.toString());
      if (index > -1) {
        this.selectedCategory[index] = v.NAME;
      }
    });
  }
  onChange(event) {
    console.log(event);
  }
  /*** Open Delete Modal ***/
  deleteModal(template: TemplateRef<any>, test: TestModel): void {
    this.selectedTest = test;
    this.selectedTest.DESCRIPTION = this.htmlCharService.decodeHtmlCharCodes(
      test.DESCRIPTION
    );
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
    if (this.selectedTest.ID) {
      this.update();
    } else {
      this.save();
    }
  }

  /*** Drop Event from sort categories Form ***/
  drop(event: CdkDragDrop<unknown>) {
    moveItemInArray(
      this.selectedCategory,
      event.previousIndex,
      event.currentIndex
    );
  }
  /*** Insert/Save Data ***/
  save(): void {
    const catIds = [];
    this.categoryData.forEach((v) => {
      const index = this.selectedCategory.indexOf(v.NAME);
      if (index > -1) {
        catIds[index] = v.ID + '-' + index;
      }
    });
    // const catIds = this.selectedCategory.join(',');
    const params = {
      query: `Call RN_EWI_TEST_INSERT('${
        this.selectedTest.Name
      }','${catIds.join(',')}','${
        this.modifiedBy
      }','${this.htmlCharService.HtmlEncode(this.selectedTest.DESCRIPTION)}')`,
      params: '',
    };
    this.executeRequest(params, 'save');
    this.modalRef.hide();
    this.isSubmitted = false;
  }

  /*** Update Data ***/
  update(): void {
    const catIds = [];
    this.categoryData.forEach((v) => {
      const index = this.selectedCategory.indexOf(v.NAME);
      if (index > -1) {
        catIds[index] = v.ID + '-' + index;
      }
    });

    // const catIds = this.selectedCategory.join(',');
    const params = {
      query: `Call RN_EWI_TEST_UPDATE(${this.selectedTest.ID},'${
        this.selectedTest.Name
      }','${catIds}',${+this.selectedTest.ACTIVE},'${
        this.modifiedBy
      }','${this.htmlCharService.HtmlEncode(this.selectedTest.DESCRIPTION)}')`,
      params: '',
    };

    this.executeRequest(params, 'update');
    this.modalRef.hide();
    this.isSubmitted = false;
  }

  /*** Toogle Status ***/
  changeStatus(event: boolean, test: TestModel): void {
    var description = '';
    if (test.DESCRIPTION != null && test.DESCRIPTION != '') {
      description = this.htmlCharService.HtmlEncode(test.DESCRIPTION);
    }
    const params = {
      query: `Call RN_EWI_TEST_UPDATE(${test.ID},'${test.Name}','${
        test.CatID
      }',${+event},'${this.modifiedBy}','${description}')`,
      params: '',
    };

    this.msg.confirm('Change Status').then((data) => {
      if (data.value) {
        this.executeRequest(params, 'update');
      } else {
        this.getTestList();
      }
    });
  }

  /*** Execute Procedular query  ***/
  executeRequest(params: any, type: string = ''): void {
    let loader = true;
    if (type === 'sort') {
      loader = false;
    }
    this.http.postData(ApiUrl.common, params, loader).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.getTestList();
          if (type === 'save') {
            this.msg.showSuccess('Test saved successfully!');
          }
          if (type === 'update') {
            this.msg.showSuccess('Test updated successfully!');
          }
        }
      },
      (error) => console.log(error)
    );
  }

  executeRequestDelete(params: any): void {
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //this.getAnswerList();
        }
      },
      (error) => console.log(error)
    );
  }
  /*** Confirm Delete ***/
  deleteTest(): void {
    debugger;
    const params = {
      query: `Call RN_EWI_TEST_DELETE(${this.selectedTest.ID})`,
      params: '',
    };
    this.executeRequest(params);
    this.modalRef.hide();
  }

  /*** Cancel Delete ***/
  decline(): void {
    this.modalRef.hide();
  }

  /*** Cancel Delete ***/
  getCategoriesName(category: string): string {
    if (category && category.length) {
      const categories = category.split(',');
      categories.map((v) => {
        const val = v.split('-');
        return val[0];
      });
      console.log(categories);
      let count = 0;
      const catName = [];
      this.categoryData.forEach((v) => {
        const index = categories.indexOf(v.ID.toString());

        if (index > -1) {
          catName[index] = v.NAME;
          count++;
        }
      });
      return catName.join(', ');
    }
    return '';
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
