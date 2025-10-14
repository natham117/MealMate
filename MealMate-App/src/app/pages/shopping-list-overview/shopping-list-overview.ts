import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Einkaufsliste {
  id: number;
  titel: string;
  datum: string;
  artikel: { name: string; menge: string; gekauft: boolean }[];
}

@Component({
  selector: 'app-shopping-list-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shopping-list-overview.html',
  styleUrls: ['./shopping-list-overview.css']
})
export class ShoppingListOverview {
  constructor(private router: Router) {}

  einkaufslisten: Einkaufsliste[] = [
    {
      id: 1,
      titel: 'Wocheneinkauf',
      datum: '2025-10-14',
      artikel: [
        { name: 'Milch', menge: '1L', gekauft: true },
        { name: 'Brot', menge: '1x', gekauft: false },
        { name: 'Äpfel', menge: '6 Stück', gekauft: false }
      ]
    },
    {
      id: 2,
      titel: 'Partyvorbereitung',
      datum: '2025-10-10',
      artikel: [
        { name: 'Chips', menge: '3x', gekauft: true },
        { name: 'Bier', menge: '2 Kästen', gekauft: true }
      ]
    }
  ];

  oeffneListe(liste: Einkaufsliste) {
    this.router.navigate(['/shopping-list-details', liste.id]);
  }

  berechneFortschritt(liste: Einkaufsliste): number {
    const total = liste.artikel.length;
    const gekauft = liste.artikel.filter(a => a.gekauft).length;
    return total ? (gekauft / total) * 100 : 0;
  }
  gekaufteAnzahl(liste: Einkaufsliste): number {
  return liste.artikel
    ? liste.artikel.filter((artikel) => artikel.gekauft).length
    : 0;
  }

}
