import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { ApiUrl } from 'src/app/core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MessageService } from 'src/app/core/services/message/message.service';
import { UserService } from 'src/app/core/services/user/user.service';

import * as CryptoJS from 'crypto-js';
import { Subject, Subscription } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { HtmlCharService } from 'src/app/htmchar-service.service';
@Component({
  selector: 'app-user-test-intro',
  templateUrl: './test-intro.component.html',
  styleUrls: ['./test-intro.component.css'],
})
export class TestIntroComponent implements OnInit {
  hideTestPopUp = true;
  hideFAQTestPopUp = true;
  public testData = [];
  userId = 0;
  showReportTable = false;
  reports = [];
  userSubscription: Subscription;
  name = '';
  url = '';
  selectedFAQ=0;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  testDescription = '';
  termAndConditionAccepted=false;
  testID=0;
  faqList=[
    {question:`Do I really need to take this test?`,Answer:`Absolutely! Whether you’re happy or extremely unhappy, all it will take is a few questions and the power of Apollo Remote Healthcare’s Happy Workspaces super-fast algorithm to determine where you’re at mentally. `},
    {question:`How long will this test take?`,Answer:`We have two tests: The GV Scale takes less than 2 minutes while the Emotional Wellness Index (EWI) can take up to 15 minutes. These tests have been created and powered by NWNT.`},
    {question:`Do I need to take both tests?`,Answer:`That entirely depends on how you do on the GV Scale. If it detects that you are unhappy, worried or depressed, it is strongly recommended that you take the EWI as well.`},
    {question:`How many questions does it have?`,Answer:`The GV Scale has 7 questions while the EWI has 55 questions.`},
    {question:`Can I stop midway and take the remainder of the test later?`,Answer:`Though we wouldn’t advise it, if you do have an outage of some sort, don’t fret. Your progress will be autosaved and you can just login and continue taking it whenever it works for you.`},
    {question:`Will there be any personal questions on the test?`,Answer:`No. We do not ask for any personal or sensitive information in the test. All the questions have been designed in such a way that they are everyday questions that you would be okay with divulging to a friend or a sensitive co-worker.`},
    {question:`How do I know these tests work?`,Answer:`Because these tests and the algorithm have been designed by two world-famous psychiatrists and happiness coaches, who pored over it for over five years before perfecting it. You can read up about them and the awesome work they do here (hyperlink).  `},
    {question:`Will the test tell me which are of my life is worrying me or making me unhappy?`,Answer:`Yes, it will. If you take the EWI, you will get a detailed report about your state of mind and how happy or unhappy you are with your work, family, personal life and so on.`},
    {question:`Is there a score that one has to get to be certified happy?`,Answer:`Yes, there is. But you’ll have to take the test to understand what your score is and whether that comes with a happy emoji or a worried one. `},
    {question:`Can I do this test again to check my happiness quotient?`,Answer:`For sure. You can take it any number of times, but a word of caution: the algorithm changes up the questions and the answers to ensure there’s no gaming the system!`},
    {question:`What happens after I take the test?`,Answer:`If you’re certified happy, then you can carry on your merry way.`},
    {question:`What if it says I am depressed or unhappy?`,Answer:`There will be easy links on your Happy Workspaces dashboard that connect you to an Apollo Remote Healthcare counsellor for a virtual session. You can just sign up and get the help you need.`},
    {question:`What if a counsellor isn’t enough?`,Answer:`They will then refer you to a clinical psychologist or help you get a virtual consultation with a psychiatrist within the Apollo Hospitals’ Group  ecosystem, depending on what help you need.`},
    {question:`How will these calls happen?`,Answer:`They can happen either by a video consultation, a meeting with the video off or through a simple audio call. It’s your choice.`},
    {question:`How long will these sessions go on for?`,Answer:`A typical session can last anywhere between 20 and 45 minutes depending on how severe your issue is. There is no upper or lower limit on time.`},
    {question:`Will there be follow-up sessions?`,Answer:`Should the clinician/counsellor recommend a follow-up session, they will set a date and ask you to connect for a review. We will send you reminders to block the appointment and to attend the session.`},
    {question:`What if I miss the session?`,Answer:`We hope you don’t, because sessions are scheduled based on prior appointment. You will have to reschedule your session on our dashboard again. `},
    {question:`Will my company/employer/boss be verified on my results and treatment?`,Answer:`No. Unless you specifically sign a waiver allowing them access, all your Electronic Medical Records will be held by Apollo Remote Healthcare with the strictest patient confidentiality.`},
    {question:`If I have suicidal thoughts or tendencies, will my data be shared with anyone?`,Answer:`There are certain exigent circumstances that allow a treating physician to notify the necessary authorities – including when a patient is at risk of causing self-harm or harm to others. We follow the same protocols, but only when it is legally tenable and absolutely necessary.`},
    {question:`Is there a cap on the number of sessions I can attend with a counsellor/psychologist/psychiatrist?`,Answer:`None whatsoever. You can get as much help, as many times as you need it for the duration of your organization’s engagement with Apollo Remote Healthcare’s Happy Workspaces program.`},
    {question:`What do I do after that? Can I still access the same therapist?`,Answer:`You can contact our support desk at aths_sales@apollohospitals.com or WhatsApp us at +918925230444 for assistance. You will be charged at retail rates for sessions that are solicited ex-parte though.`}

  ];
  constructor(
    public router: Router,
    private http: HttpService,
    private user: UserService,
    private route: ActivatedRoute,
    private htmlCharService: HtmlCharService,
    private message:MessageService
  ) {}
  ngOnInit(): void {
    this.url = this.route.snapshot.params.id;
    this.getTestByID();
    this.userSubscription = this.user.currentUserSubject.subscribe(
      (userData) => {
        if (userData) {
          debugger;
          this.userId = userData.result[0].USERID;
          this.name =
            userData.result[0].FIRSTNAME + ' ' + userData.result[0].LASTNAME;
        }
      }
    );
  }
  getTestByID(): void {
    let url = this.route.snapshot.params.id;
    if (url) {
      url = url
        .replaceAll('xMl3Jk', '+')
        .replaceAll('Por21Ld', '/')
        .replaceAll('Ml32', '=');
      const bytes = CryptoJS.AES.decrypt(url, '@Test');
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      var testID = parseInt(originalText);
      this.testID=testID;
    }
    const params = {
      query: `Call RN_EWI_GET_TEST_BYID('${testID}')`,
      params: '',
    };

    this.http.postData(ApiUrl.queryExecute, params).subscribe(
      (resp: any) => {
        if (!!resp) {
          debugger;
          this.testDescription = this.htmlCharService.decodeHtmlCharCodes(
            resp.data[0].DESCRIPTION
          );
        }
      },
      (error) => console.log(error)
    );
  }
  startTest() {
    if(!this.termAndConditionAccepted)
    {
      this.message.showError('Please accept Terms & Conditions.');
      return;
    }
    this.router.navigateByUrl('/p/questions');
  }
}
