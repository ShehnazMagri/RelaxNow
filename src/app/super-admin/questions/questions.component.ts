import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { HtmlCharService } from 'src/app/htmchar-service.service';

@Component({
  selector: 'app-questions-sdm',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
})
export class QuestionsSSDMComponent implements OnInit {
  @Input('CORPORATECODE') CORPORATECODE: string;
  @Output() newItemEvent = new EventEmitter<boolean>();

  testStarted = false;
  testDone = false;
  testCompleted = false;
  testId = 0;
  scheduleTestId;
  resultId = 0;
  totalMarks = 0;
  totalQuestions = 0;
  totalQuestionScore = [];
  questionsDone = [];
  userDetails;
  questionData: any = [];
  stepDone: any = [];
  descriptionData: any = [];
  todayDate = moment().format('Do MMM YYYY');
  level = 'lvl2';
  answerAttemped: any = [];
  selectedIndex = 0;
  reportpath = '';
  stressText = '';
  resultDescription = '';
  bColor = '';
  testDescription = '';
  isButtonDisabled = false;
  pendingTest: any = [];
  constructor(
    private http: HttpService,
    private message: MessageService,
    private user: UserService,
    private htmlCharService: HtmlCharService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const testID = localStorage.getItem('_TestId');
    this.scheduleTestId = localStorage.getItem('ScheduleTestId');
    if (+testID > 0) {
      this.testId = +testID;
    } else {
      this.testId = 3;
    }

    if (
      this.user.currentUserValue &&
      this.user.currentUserValue.result &&
      this.user.currentUserValue.result.length
    ) {
      this.userDetails = this.user.currentUserValue.result[0];
      this.userDetails.CORPORATECODE = this.CORPORATECODE;
      this.userDetails.USERID = 0;
      if (this.userDetails.CORPORATECODE) {
        debugger;
        this.checkPendingTests(this.userDetails.CORPORATECODE);
      }
    }
  }

  /*** Start test ***/
  startTest(): void {
    // if (this.testCompleted) {
    //   return;
    // }
    this.testStarted = true;
    // this.getResultId();
  }

  /*** Check Test completed ***/
  checkTestAttempt(): void {
    //
    const params = {
      query: `Call RN_EWI_CUSTOMER_COMPLETED_TEST(${this.userDetails.USERID},${this.testId})`,
      params: '',
    };

    this.http.postData(ApiUrl.queryExecute, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          //
          this.testCompleted = resp.data[0]
            ? !!resp.data[0].PREVIOUS_RESULTID
            : false;
          this.getPreviousTest();
        }
      },
      (error) => console.log(error)
    );
  }
  /*** Get Result Description Listing ***/
  getResultDescription(): void {
    const params = {
      query: `Call RN_EWI_TEST_RESULT_RANGE_GET_BY_ID(${this.testId})`,
      params: '',
    };

    this.http.postData(ApiUrl.queryExecute, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.descriptionData = resp.data ? resp.data : [];
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Get Question Listing ***/
  getQuestions(): void {
    const params = {
      query: `Call RN_EWI_TEST_GETDETAILSBY_TESTID(${this.testId})`,
      params: '',
    };
    const specialChars = new RegExp(/[\/\|()\$~%\":\*\?<>{}\!]/g);

    this.http.postData(ApiUrl.patient.questions, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.questionData = resp.data;
          this.totalQuestions = 0;
          this.questionData.forEach((element) => {
            this.totalQuestions =
              this.totalQuestions + element.QuestionList.length;
            element.QuestionList.forEach((elm) => {
              elm.Question = this.htmlCharService.decodeHtmlCharCodes(
                elm.Question
              );
              elm.Option_list.map((opt) => {
                opt.Answer = this.htmlCharService.decodeHtmlCharCodes(
                  opt.Answer
                );
                opt.checked = false;
              });
            });
          });
          this.questionData.sort((a, b) => {
            return a.CategoryOrder - b.CategoryOrder;
          });
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Get Result Id ***/
  getPreviousTest(): void {
    const params = {
      query: `Call RN_EWI_CUSTOMER_PENDING_TEST('${this.userDetails.USERID}','${this.testId}')`,
      params: '',
    };
    this.answerAttemped = [];
    this.http.postData(ApiUrl.queryExecute, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          if (resp.data.length) {
            const result = resp.data && resp.data.length ? resp.data : [];
            this.resultId = result.length ? result[0].RESULTID : 0;
            // if (this.descriptionData) {
            //   this.descriptionData = false;
            // }
            result.forEach((element) => {
              this.calculateScore(
                element.QUESTION_ID,
                element.ANSWER_VALUE,
                element.CATEGORY_ID,
                element.ANSWER_ID
              );
              this.answerAttemped.push({
                ques: element.QUESTION_ID,
                answer: element.ANSWER_ID,
              });
            });
          } else {
            this.getResultId();
          }
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Get Result Id ***/
  getResultId(): void {
    const params = {
      query: `Call RN_EWI_TEST_CUSTOMER_RESULT_INSERT('${this.testId}' ,'${
        this.userDetails.USERID
      }' ,'1','-1','1','${moment().format('YYYY-MM-DD')}','${
        this.userDetails.FIRSTNAME + ' ' + this.userDetails.LASTNAME
      }')`,
      params: '',
    };

    this.http.postData(ApiUrl.queryExecute, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.resultId =
            resp.data && resp.data.length ? resp.data[0].test_result_id : 0;
        }
      },
      (error) => console.log(error)
    );
  }

  getTestByID(): void {
    const params = {
      query: `Call RN_EWI_GET_TEST_BYID('${this.testId}')`,
      params: '',
    };

    this.http.postData(ApiUrl.queryExecute, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.testDescription = this.htmlCharService.decodeHtmlCharCodes(
            resp.data[0].DESCRIPTION
          );
        }
      },
      (error) => console.log(error)
    );
  }
  /*** Check Answrs***/
  checkAnswer(questionId, answerId): boolean {
    if (this.answerAttemped.length) {
      for (const index of this.answerAttemped) {
        if (this.answerAttemped[index]) {
          if (
            this.answerAttemped[index].ques === questionId &&
            this.answerAttemped[index].answer === answerId
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /*** Submit Answers ***/
  submitAnswer(ques: any, answer: any, categoryId: any): void {
    const params = {
      query: `Call RN_EWI_TEST_CUSTOMER_RESULT_DETAILS_INSERT('${
        this.resultId
      }','${ques.QuestionID}','${categoryId}','${answer.AnswerID}','${
        answer.anser_value
      }','${this.userDetails.FIRSTNAME + ' ' + this.userDetails.LASTNAME}')`,
      params: '',
    };
    this.isButtonDisabled = true;
    this.http.postData(ApiUrl.queryExecute, params, false).subscribe(
      (resp: any) => {
        if (!!resp) {
          const aIndex = this.answerAttemped.indexOf(
            (elem) => ques.QuestionID === elem.ques
          );
          if (aIndex < 0) {
            this.answerAttemped.push({
              categoryId,
              ques: ques.QuestionID,
              answer: answer.AnswerID,
            });
          } else {
            this.answerAttemped[aIndex] = {
              categoryId,
              ques: ques.QuestionID,
              answer: answer.AnswerID,
            };
          }

          this.calculateScore(
            ques.QuestionID,
            answer.anser_value,
            categoryId,
            answer.AnswerID
          );
          this.isButtonDisabled = false;
        }
      },
      (error) => console.log(error)
    );
  }

  /*** Calculate Score ***/
  calculateScore(
    ques: any,
    answer: any,
    categoryId: any = 0,
    answerId = 0
  ): void {
    //
    const attemptedQues = { categoryId, ques };
    // const qIndex = this.questionsDone.indexOf(attemptedQues);
    const qIndex = this.questionsDone.findIndex(
      (x) =>
        x.categoryId == attemptedQues.categoryId && x.ques == attemptedQues.ques
    );
    if (qIndex > -1) {
      this.totalQuestionScore[qIndex] = +answer;
    } else {
      this.questionsDone.push(attemptedQues);
      this.totalQuestionScore.push(+answer);
    }
    this.questionData.forEach((element) => {
      element.QuestionList.forEach((elm) => {
        if (+element.CategoryID === +categoryId) {
          elm.Option_list.map((opt) => {
            if (+elm.QuestionID === +ques && +opt.AnswerID === +answerId) {
              opt.checked = true;
            }
          });
        }
      });
    });

    this.totalMarks = this.totalQuestionScore.reduce(
      (a, b) => parseInt(a, 0) + parseInt(b, 0)
    );
    this.checkQuestionDone();
  }

  /*** Check Attempted Questions ***/
  checkQuestionDone(isSubmit = false): void {
    let loopBReak = true;
    this.questionData.every((element, index) => {
      element.QuestionList.every((elm) => {
        const categoryId = element.CategoryID;
        const ques = elm.QuestionID;
        const attemptedQues = { categoryId, ques };

        if (
          JSON.stringify(this.questionsDone).indexOf(
            JSON.stringify(attemptedQues)
          ) < 0
        ) {
          if (isSubmit) {
            if (
              this.selectedIndex === this.questionData.length - 1 ||
              this.selectedIndex === this.stepDone.length - 1
            ) {
              this.message.showError(
                'Please attempt all the questions to submit. Check in other tabs also!'
              );
            }
            this.selectedIndex = index;
          }
          if (!this.stepDone.includes(index)) {
            this.stepDone.push(index);
          }
          loopBReak = false;
        }
        return loopBReak;
      });
      return loopBReak;
    });
  }

  /*** Submit Test ***/
  submitTest() {
    //
    let color = '';
    const that = this;
    if (this.questionsDone.length < this.totalQuestions) {
      this.checkQuestionDone(true);
      window.scrollTo(0, 0);
      return;
    }

    this.testDone = true;
    let testStatus = '';
    let RESULT_DESCRIPTION = '';
    let _rec = '';
    let sugg_ = '';
    //this.totalMarks = 207;

    if (this.descriptionData && this.descriptionData.length) {
      this.descriptionData.forEach((element) => {
        if (
          this.totalMarks >= element.MIN_VALUE &&
          this.totalMarks <= element.MAX_VALUE
        ) {
          testStatus = element.RESULT_TERM;
          RESULT_DESCRIPTION = element.RESULT_DESCRIPTION;
          color = element.COLOR;
          this.level = element.SMILIES;
          _rec = element.Recommendations;
          sugg_ = element.Consultation;
        }
      });

      // var dataResponse = this.descriptionData.filter(
      //   (x) => x.MIN_VALUE <= this.totalMarks && x.MAX_VALUE >= this.totalMarks
      // );
      // testStatus = dataResponse[0].RESULT_TERM;
      // RESULT_DESCRIPTION = dataResponse[0].RESULT_DESCRIPTION;
      // color = dataResponse[0].COLOR;
      // this.level = dataResponse[0].SMILIES;
      // _rec = dataResponse[0].Recommendations;
      // sugg_ = dataResponse[0].Consultation;
    }

    if (this.testId === 3) {
      if (this.totalMarks < 21) {
        testStatus = 'Very Unhappy';
        this.level = 'lvl4';
        color = 'red';
      } else if (this.totalMarks > 20 && this.totalMarks < 41) {
        testStatus = 'Moderately Unhappy';
        this.level = 'lvl3';
        color = 'orange';
      } else if (this.totalMarks > 40 && this.totalMarks < 61) {
        testStatus = 'Moderately Happy';
        this.level = 'lvl2';
        color = 'yellow';
      } else {
        testStatus = 'Very Happy';
        this.level = 'lvl1';
        color = 'green';
      }
    }
    RESULT_DESCRIPTION = new DOMParser().parseFromString(
      RESULT_DESCRIPTION,
      'text/html'
    ).documentElement.textContent;
    this.resultDescription = RESULT_DESCRIPTION;
    this.stressText = testStatus;
    let gender = '';
    if (this.userDetails.GENDER == '5') {
      gender = 'Male';
    } else if (this.userDetails.GENDER == '6') {
      gender = 'Female';
    } else {
      gender = 'Other';
    }

    const params = {
      Patient_Name: `${this.userDetails.FIRSTNAME} ${this.userDetails.LASTNAME}`,
      email: `${this.userDetails.EMAIL}`,
      Gender: `${this.userDetails.GENDER}`,
      TestDate: moment().format('YYYY-MM-DD'),
      Level: this.level,
      CUSTOMER_ID: `${this.userDetails.USERID}`,
      TEST_STATUS: '1',
      TEST_SCORE: `${this.totalMarks}`,
      TEST_COMMENTS: `${testStatus}`,
      ID: `${this.resultId}`,
      scheduleTestId: `${this.scheduleTestId}`,
      Stress_Text: `${testStatus}`,
      REGISTRATION_NO: `${this.userDetails.RELATIONSHIP_NUMBER}`,
      RESULT_DESCRIPTION,
      Test_ID: this.testId,
      totalMarks: this.totalMarks,
      color,
      testName: this.questionData[0]?.TestName,
      _rec: _rec,
      sugg_: sugg_,
      AssesmentCode: 0,
      CART_DETAIL_ID: 0,
    };
    this.bColor = color;
    this.http.postData(ApiUrl.report, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.reportpath = resp.data;
          localStorage.setItem('ScheduleTestName', '0');
          localStorage.setItem('ScheduleTestId', '0');
          localStorage.setItem('_TestId', '0');
          if (this.userDetails.CORPORATECODE) {
            this.checkPendingTests(this.userDetails.CORPORATECODE);
          }
        }
      },
      (error2) => console.log(error2)
    );
  }

  emptyId() {
    if (
      this.userDetails.CORPORATECODE != null &&
      this.userDetails.CORPORATECODE != ''
    ) {
      localStorage.setItem('_TestId', '0');
    }
    this.router.navigateByUrl('/p/dashboard');
  }
  checkPendingTests(code): void {
    const params = {
      query: `Call RN_GET_CORPPRATE_USER_NOT_COMPLETED_TEST_SUPER_ADMIN('${code}','${this.userDetails.USERID}')`,
      params: '',
    };

    this.http.postData(ApiUrl.queryExecute, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          this.pendingTest = resp.data;

          this.testId = this.pendingTest[0].testId;
          localStorage.setItem('_TestId', this.testId.toString());
          this.getQuestions();
          this.getResultDescription();
          this.checkTestAttempt();
          this.getTestByID();
        }
      },
      (error) => console.log(error)
    );
  }

  startNextTest(): void {
    if (this.pendingTest[0]) {
      this.testId = this.pendingTest[0].testId;
      localStorage.setItem('_TestId', this.testId.toString());
      // this.newItemEvent.emit(true);

      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }
}
