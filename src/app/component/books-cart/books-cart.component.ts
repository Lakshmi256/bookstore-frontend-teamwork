import { Component, OnInit, ViewChild } from "@angular/core";
import { Order } from "src/app/shared/model/order.model";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";

import {
  MatSnackBar,
  MatTableDataSource,
  MatPaginator,
} from "@angular/material";
import { CartServiceService } from "src/app/shared/service/cart-service.service";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { Costomer } from "src/app/shared/model/costomer.model";

@Component({
  selector: "app-books-cart",
  templateUrl: "./books-cart.component.html",
  styleUrls: ["./books-cart.component.scss"],
})
export class BooksCartComponent implements OnInit {
  orders;
  finalAmount: number;
  orderList: MatTableDataSource<any>;
  size: number;
  page = 1;
  cosForm = false;
  quantity = 1;
  customerForm: FormGroup;
  cusomerDetails = new Costomer();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  displayedColumns: string[] = ["bookName", "price", "quantity", "total"];
  constructor(
    private matSnackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private cartService: CartServiceService,
    private route: Router
  ) {
    this.cartService.autoRefresh$.subscribe(() => {
      this.getOrderList();
      this.orderList.paginator = this.paginator;
    });
  }

  ngOnInit() {
    this.customerForm = this.formBuilder.group({
      customerName: ["", Validators.required],
      contact: [
        "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      pinCode: [
        "",
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
      locality: [""],
      address: ["", [Validators.required]],
      city: ["", [Validators.required]],
      landMark: ["", [Validators.required]],
    });
    this.cartService.autoRefresh$.subscribe(() => {
      this.getOrderList();
      this.orderList.paginator = this.paginator;
    });
    this.getOrderList();
    this.setBudgetTotal();
  }

  get f() {
    return this.customerForm.controls;
  }

  getOrderList() {
    this.cartService.getCartList().subscribe((message) => {
      this.orders = message.orders;
      this.size = this.orders.length;
      console.log(message.orders.length);
      this.orderList = new MatTableDataSource(this.orders);
      const price = this.orders.map((i) => i.total);
      const total = price.reduce((a, b) => a + b, 0);
      this.finalAmount = total;
    });
  }
  removeCartBook(bookId) {
    this.cartService.removeFromeBag(bookId).subscribe((message) => {
      this.matSnackBar.open("Book Removed From Cart", "OK", {
        duration: 4000,
      });
    });
  }
  increaseQuantity(order) {
    console.log(order);

    this.orders.forEach((fetchedBook) => {
      if (fetchedBook.bookId == order.bookId) {
        order.quantity = order.quantity + 1;
      }
    });

    this.cartService.updateOrderQuantity(order).subscribe(
      (message) => {
        console.log(message);
      },
      (error) => {
        console.log(error);
      }
    );
  }
  decreseQuantity(order) {
    console.log(order);
    if (order.quantity > 0) {
      this.orders.forEach((fetchedBook) => {
        if (fetchedBook.bookId == order.bookId) {
          order.quantity = order.quantity - 1;
          console.log("quantity updated", order.quantity);
        }
      });

      this.cartService.updateOrderQuantity(order).subscribe(
        (message) => {
          console.log(message);
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      this.cartService.removeFromeBag(order.bookId).subscribe((message) => {
        this.matSnackBar.open("Book Removed From Cart", "OK", {
          duration: 4000,
        });
      });
    }
  }

  openCustomerDeatilsForm() {
    this.cosForm = true;
  }

  onclickSubmitCustomer() {
    this.cusomerDetails.customerName = this.customerForm.controls.customerName.value;
    this.cusomerDetails.contact = this.customerForm.controls.contact.value;
    this.cusomerDetails.pinCode = this.customerForm.controls.pinCode.value;
    this.cusomerDetails.locality = this.customerForm.controls.locality.value;
    this.cusomerDetails.city = this.customerForm.controls.city.value;
    this.cusomerDetails.landMark = this.customerForm.controls.landMark.value;
    this.cusomerDetails.address = this.customerForm.controls.address.value;
    console.log(this.cusomerDetails);
    this.setCustomerDetails();
    this.route.navigate(["greeting"]);
    this.cartService.confirmOrder(this.orders).subscribe((message) => {
      this.matSnackBar.open("Order Placed Successfully", "OK", {
        duration: 4000,
      });
    });
  }
  setCustomerDetails() {
    this.cartService.setCustomerDetails(this.cusomerDetails);
  }
  setBudgetTotal() {
    this.cartService.setBudgetTotal(this.orders.size());
  }
}
