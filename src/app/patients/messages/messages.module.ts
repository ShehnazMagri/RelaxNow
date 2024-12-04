import { niceDateFormatPipe } from './dateFormat.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MessagesRoutingModule } from './messages-routing.module';
import { MessagesComponent } from './messages.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  declarations: [MessagesComponent, niceDateFormatPipe],
  imports: [
    CommonModule,
    FormsModule,
    MessagesRoutingModule,
    Ng2SearchPipeModule,
  ],
})
export class MessagesModule {}
