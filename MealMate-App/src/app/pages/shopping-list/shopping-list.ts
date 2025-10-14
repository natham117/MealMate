import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shopping-list',
  imports: [],
  templateUrl: './shopping-list.html',
  styleUrl: './shopping-list.css'
})
export class ShoppingList {
  constructor(private router: Router) {}

  goToOverview() {
    this.router.navigate(['/shopping-list-overview']);
  }
}
