import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CommonServiceService } from '../../../common-service.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-expired',
  templateUrl: './expired.component.html',
  styleUrls: ['./expired.component.css']
})

export class ExpiredComponent implements OnInit {
  products = [];
  modalRef: BsModalRef;
  errorMessage: string;
  name;
  id;
  key;
  constructor(
    private commonService: CommonServiceService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    this.commonService.getProducts().subscribe(
      (data: any[]) => {
        this.products = data;
        console.log(this.products);
        $(function () {
          $('table').DataTable();
        });
      },
      (error) => (this.errorMessage = <any>error)
    );
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg modal-dialog-centered',
    });
  }

  deleteModal(template: TemplateRef<any>, product) {
    this.id = product.id;
    this.modalRef = this.modalService.show(template, {
      class: 'modal-sm modal-dialog-centered',
    });
  }

  save() {
    this.modalRef.hide();
  }

  deleteProduct() {
    this.products = this.products.filter((a) => a.id !== this.id);
    this.commonService.deleteProduct(this.id).subscribe((data: any[]) => {
      this.modalRef.hide();
      this.getProducts();
    });
  }

  decline() {
    this.modalRef.hide();
  }

}