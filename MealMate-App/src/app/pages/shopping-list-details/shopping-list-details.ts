import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shopping-list-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shopping-list-details.html',
  styleUrls: ['./shopping-list-details.css']
})
export class ShoppingListDetails implements OnInit {
  listeId: number | null = null;
  liste: any = null;

  alleListen = [
    {
      id: 1,
      titel: 'Wocheneinkauf',
      artikel: [
        { name: 'Milch', menge: '1L', gekauft: true },
        { name: 'Brot', menge: '1x', gekauft: false },
        { name: 'Äpfel', menge: '6 Stück', gekauft: false }
      ]
    },
    {
      id: 2,
      titel: 'Partyvorbereitung',
      artikel: [
        { name: 'Chips', menge: '3x', gekauft: true },
        { name: 'Bier', menge: '2 Kästen', gekauft: true }
      ]
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.listeId = Number(params.get('id'));
      this.liste = this.alleListen.find(l => l.id === this.listeId);
    });
  }

  toggleGekauft(artikel: any) {
    artikel.gekauft = !artikel.gekauft;
  }
}
