import { MessageService } from 'src/app/core/services/message/message.service';
import { ApiUrl } from './../../core/apiUrl';
import { HttpService } from 'src/app/core/services/http/http.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader/loader.service';
import { DataTableDirective } from 'angular-datatables';
declare var $: any;
declare var Morris: any;
@Component({
  selector: 'app-super-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
  constructor(
    private http: HttpService,
    private loader: LoaderService,
    private msg: MessageService
  ) {}
  ngOnDestroy(): void {}

  ngOnInit(): void {}
}
