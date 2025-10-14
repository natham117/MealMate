// import { Component } from '@angular/core';
import { Router } from '@angular/router';

// @Component({
//   selector: 'app-shopping-list',
//   imports: [],
//   templateUrl: './shopping-list.html',
//   styleUrl: './shopping-list.css'
// })
// export class ShoppingList {
//   constructor(private router: Router) {}

//   goToOverview() {
//     this.router.navigate(['/shopping-list-overview']);
//   }
// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Einkaufsartikel {
  id: number;
  name: string;
  menge: string;
  gekauft: boolean;
}

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shopping-list.html',
  styleUrls: ['./shopping-list.css']
})
export class ShoppingList {
  constructor(private router: Router) {}
  goToOverview() {
     this.router.navigate(['/shopping-list-overview']);
   }
  suchbegriff = '';
  formular_aktiv = false;

  neuerArtikel: Einkaufsartikel = this.leererArtikel();
  artikelListe: Einkaufsartikel[] = [
    { id: 1, name: 'Milch', menge: '1L', gekauft: false },
    { id: 2, name: 'Eier', menge: '10 Stück', gekauft: true },
    { id: 3, name: 'Tomaten', menge: '500g', gekauft: false }
  ];

  // 🔍 Filter für Suchfeld
  get gefilterteArtikel(): Einkaufsartikel[] {
    if (!this.suchbegriff.trim()) return this.artikelListe;
    const s = this.suchbegriff.toLowerCase();
    return this.artikelListe.filter(a => a.name.toLowerCase().includes(s));
  }

  // ➕ Formular öffnen / schließen
  oeffneFormular() {
    this.neuerArtikel = this.leererArtikel();
    this.formular_aktiv = true;
  }

  schliesseFormular() {
    this.formular_aktiv = false;
  }

  // 💾 Artikel speichern
  speichereArtikel() {
    if (!this.neuerArtikel.name.trim()) {
      alert('Bitte gib einen Artikelnamen ein!');
      return;
    }

    const neuerArtikel: Einkaufsartikel = {
      id: this.artikelListe.length > 0 ? Math.max(...this.artikelListe.map(a => a.id)) + 1 : 1,
      name: this.neuerArtikel.name.trim(),
      menge: this.neuerArtikel.menge.trim() || '1x',
      gekauft: false
    };

    this.artikelListe.unshift(neuerArtikel);
    this.formular_aktiv = false;
  }

  // 🗑️ Artikel löschen
  entferneArtikel(index: number) {
    this.artikelListe.splice(index, 1);
  }

  // ✅ Artikel abhaken
  toggleGekauft(artikel: Einkaufsartikel) {
    artikel.gekauft = !artikel.gekauft;
  }

  private leererArtikel(): Einkaufsartikel {
    return {
      id: 0,
      name: '',
      menge: '',
      gekauft: false
    };
  }
}

