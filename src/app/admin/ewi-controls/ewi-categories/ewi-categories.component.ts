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
import { GroupModel } from '../ewi-groups/ewi-groups.model';
import { QuestionModel } from '../ewi-questions/ewi-questions.model';
import { CategoryModel } from './ewi-categories';

@Component({
  selector: 'app-ewi-categories',
  templateUrl: './ewi-categories.component.html',
  styleUrls: ['./ewi-categories.component.css'],
})
export class EwiCategoriesComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  categoryData: Array<CategoryModel> = [];
  questionData: Array<QuestionModel> = [];
  groupData: Array<GroupModel> = [];

  modalRef: BsModalRef;
  isSubmitted = false;
  selectedCategory: CategoryModel = new CategoryModel();
  selectedQuestions = [];
  // Datatable Options
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  modifiedBy = localStorage.getItem('username')
    ? localStorage.getItem('username')
    : 'admin';
  optionsArray = [
    {
      displayValue: 'English',
    },
    {
      displayValue: 'Dutch',
    },
    {
      displayValue: 'French',
    },
    {
      displayValue: 'German',
    },
    {
      displayValue: 'Swedish',
    },
    {
      displayValue: 'Finnish',
    },
    {
      displayValue: 'Russian',
    },
    {
      displayValue: 'Chinese',
    },
    {
      displayValue: 'Japanese',
    },
    {
      displayValue: 'Spanish',
    },
    {
      displayValue: 'Portugese',
    },
  ];
  constructor(
    private modalService: BsModalService,
    private http: HttpService,
    private msg: MessageService,
    private htmlCharService: HtmlCharService
  ) {}

  ngOnInit(): void {
    this.getCategoryList();
    this.getQuestionList();
    this.getGroupList();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  /*** Get Categories Listing ***/
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
          this.categoryData = result;
          // .filter((v) => {
          //   if (v.ACTIVE) { return v; }
          // });
          this.rerender();
        }
      },
      (error) => console.log(error)
    );
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
          this.questionData = result.filter((v) => {
            if (v.ACTIVE) {
              v.NAME = this.htmlCharService.decodeHtmlCharCodes(v.NAME);
              return v;
            }
          });

          // this.questionData = result.forEach((v) => {
          //   v.NAME = this.htmlCharService.decodeHtmlCharCodes(v.NAME);
          // });
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
          this.groupData = result;
          // .filter((v) => {
          //   if (v.ACTIVE) { return v; }
          // });
        }
      },
      (error) => console.log(error)
    );
  }
  /*** Open Add/Edit Modal ***/
  openModal(
    template: TemplateRef<any>,
    category: CategoryModel = new CategoryModel()
  ): void {
    this.selectedCategory = category;
    this.isSubmitted = false;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
    this.selectedQuestions =
      category.QuesID && category.QuesID.length
        ? category.QuesID.split(',')
        : [];
  }

  /*** Open Delete Modal ***/
  deleteModal(template: TemplateRef<any>, category: CategoryModel): void {
    this.selectedCategory = category;
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
    if (this.selectedCategory.ID) {
      this.update();
    } else {
      this.save();
    }
  }

  /*** Insert/Save Data ***/
  save(): void {
    const quesIds = this.selectedQuestions.join(',');

    const params = {
      query: `Call RN_EWI_CATEGORY_INSERT('${this.selectedCategory.NAME}',true,'${quesIds}','${this.selectedCategory.GroupID}','${this.modifiedBy}')`,
      params: '',
    };
    this.executeRequestDelete(params, 'save');
    this.modalRef.hide();
    this.isSubmitted = false;
  }

  /*** Update Data ***/
  update(): void {
    const quesIds = this.selectedQuestions.join(',');

    const params = {
      query: `Call RN_EWI_CATEGORY_UPDATE(${this.selectedCategory.ID},'${
        this.selectedCategory.NAME
      }',${+this.selectedCategory.LOCKED},'${quesIds}','${
        this.selectedCategory.GroupID
      }',${this.selectedCategory.ACTIVE},'${this.modifiedBy}')`,
      params: '',
    };

    this.executeRequestDelete(params, 'update');
    this.modalRef.hide();
    this.isSubmitted = false;
  }

  /*** Toogle Status ***/
  changeStatus(event: boolean, category: CategoryModel): void {
    const params = {
      query: `Call RN_EWI_CATEGORY_UPDATE(${category.ID},'${
        category.NAME
      }',1,'${category.QuesID}','${category.GroupID}',${+event},'${
        this.modifiedBy
      }')`,
      params: '',
    };
    this.msg.confirm('Change Status').then((data) => {
      if (data.value) {
        this.executeRequestDelete(params, 'update');
      } else {
        this.getCategoryList();
      }
    });
  }

  executeRequestDelete(params: any, type: string = ''): void {
    this.http.postData(ApiUrl.common, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (type === 'save') {
            this.getCategoryList();
            this.msg.showSuccess('Category saved successfully!');
          }
          if (type === 'update') {
            this.getCategoryList();
            this.msg.showSuccess('Category updated successfully!');
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
          this.getCategoryList();
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Confirm Delete ***/
  deleteCategory(): void {
    const params = {
      // query: `Call RN_EWI_CATEGORY_DELETE(${this.selectedCategory.ID})`,
      query: `Call RN_EWI_CATEGORY_UPDATE(${this.selectedCategory.ID},'${this.selectedCategory.NAME}',1,'${this.selectedCategory.QuesID}','${this.selectedCategory.GroupID}',0,'${this.modifiedBy}')`,
      params: '',
    };
    for (var i = 0; i < this.groupData.length; i++) {
      var obj = this.groupData[i];

      if (obj.ID == obj.ID) {
        this.groupData.splice(i, 1);
      }
    }
    //this.executeRequest(params);
    this.modalRef.hide();
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
