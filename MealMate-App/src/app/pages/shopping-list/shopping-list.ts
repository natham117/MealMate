// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';


// interface EinkaufslistenItem {
//   name: string;
//   menge: string;
//   bearbeitung?: boolean;
// }

// interface Einkaufsliste {
//   id: number;
//   titel: string;
//   items: EinkaufslistenItem[];
// }

// @Component({
//   selector: 'shopping-list',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './shopping-list.html',
//   styleUrl: './shopping-list.css'
// })
// export class ShoppingList {
//   suchbegriff: string = '';
//   listen: Einkaufsliste[] = [
//     {
//       id: 1,
//       titel: 'Wocheneinkauf',
//       items: [
//         { name: 'Tomaten', menge: '2 Stk' },
//         { name: 'Zucker', menge: '100g' },
//         { name: 'Milch', menge: '1L' }
//       ]
//     },
//     {
//       id: 2,
//       titel: 'Grillabend',
//       items: [
//         { name: 'Würstchen', menge: '6 Stk' },
//         { name: 'Brötchen', menge: '8 Stk' },
//         { name: 'Senf', menge: '1 Tube' }
//       ]
//     }
//   ];

//   gefilterteListen: Einkaufsliste[] = this.listen;

//   formularAktiv: boolean = false;
//   detailAktiv: boolean = false;
//   neueListe: Einkaufsliste = { id: 0, titel: '', items: [{ name: '', menge: '' }] };
//   ausgewaehlteListe: Einkaufsliste | null = null;

//   // Wichtig um Produkte einer Liste hinzufügen
//   neuesProdukt: string = '';
//   neueMenge: string = '';

//   snackbarText: string = '';
//   snackbarAktiv: boolean = false;

//   // Filterfunktion
//   filtereListen() {
//     const such = this.suchbegriff.toLowerCase();
//     this.gefilterteListen = this.listen.filter(liste =>
//       liste.titel.toLowerCase().includes(such)
//     );
//   }

//   // Formular öffnen/schließen
//   oeffneFormular() {
//     this.formularAktiv = true;
//   }

//   schliesseFormular() {
//     this.formularAktiv = false;
//     this.neueListe = { id: 0, titel: '', items: [{ name: '', menge: '' }] };
//   }

//   fuegeItemHinzu() {
//     this.neueListe.items.push({ name: '', menge: '' });
//   }

//   entferneItem(index: number) {
//     this.neueListe.items.splice(index, 1);
//   }

//   speichereListe() {
//     if (!this.neueListe.titel.trim()) return;

//     const neueId = this.listen.length + 1;
//     const kopie = JSON.parse(JSON.stringify(this.neueListe));
//     kopie.id = neueId;

//     this.listen.push(kopie);
//     this.filtereListen();
//     this.schliesseFormular();
//   }
//   // Für Detailansicht

//   zeigeDetails(liste: Einkaufsliste) {
//     this.ausgewaehlteListe = liste;
//     this.detailAktiv = true;
//   }

//   schliesseDetails() {
//     this.detailAktiv = false;
//     this.ausgewaehlteListe = null;
//   }
//   // Produkt hinzufügen
//   fuegeProduktHinzu() {
//     if (!this.neuesProdukt.trim()) return;
//     this.ausgewaehlteListe?.items.push({
//       name: this.neuesProdukt,
//       menge: this.neueMenge || ''
//     });
//     this.neuesProdukt = '';
//     this.neueMenge = '';
//     this.zeigeSnackbar('Produkt hinzugefügt!');
//   }

//   // Produkt löschen
//   loescheProdukt(index: number) {
//     this.ausgewaehlteListe?.items.splice(index, 1);
//   }

//   // Produkt bearbeiten
//   bearbeiteProdukt(item: EinkaufslistenItem) {
//     item.bearbeitung = true;
//   }

//   speichereProdukt(item: EinkaufslistenItem) {
//     item.bearbeitung = false;
//     this.zeigeSnackbar('Änderungen gespeichert!');
//   }

//   // Snackbar Feedback
//   zeigeSnackbar(text: string) {
//     this.snackbarText = text;
//     this.snackbarAktiv = true;
//     setTimeout(() => (this.snackbarAktiv = false), 2000);
//   }

// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // ⬅️ Neu: HttpClient für Backend-Calls

interface EinkaufslistenItem {
  name: string;
  menge: string;
  bearbeitung?: boolean;
}

interface Einkaufsliste {
  id?: number;
  titel: string;
  items: EinkaufslistenItem[];
}

@Component({
  selector: 'shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // ⬅️ HttpClientModule hinzufügen!
  templateUrl: './shopping-list.html',
  styleUrl: './shopping-list.css'
})
export class ShoppingList implements OnInit { // ⬅️ implementiert OnInit, um beim Laden die Listen zu holen
  suchbegriff: string = '';
  listen: Einkaufsliste[] = [];
  gefilterteListen: Einkaufsliste[] = [];

  formularAktiv: boolean = false;
  detailAktiv: boolean = false;
  neueListe: Einkaufsliste = { id: 0, titel: '', items: [{ name: '', menge: '' }] };
  ausgewaehlteListe: Einkaufsliste | null = null;

  neuesProdukt: string = '';
  neueMenge: string = '';

  snackbarText: string = '';
  snackbarAktiv: boolean = false;

  private baseUrl = 'http://localhost:5000/api/shoppinglist'; // ⬅️ dein Backend-Endpunkt anpassen falls nötig
  private userId = 2; // ⬅️ später dynamisch vom Login holen, jetzt Hardcoded zum Testen

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.ladeEinkaufslisten();
  }

  // Liste vom Backend laden
  ladeEinkaufslisten() {
    this.http.get<Einkaufsliste[]>(`${this.baseUrl}/${this.userId}`).subscribe({
      next: (data) => {
        this.listen = data;
        this.gefilterteListen = [...this.listen];
      },
      error: (err) => {
        console.error('Fehler beim Laden der Listen:', err);
      }
    });
  }

  // Filterfunktion
  filtereListen() {
    const such = this.suchbegriff.toLowerCase();
    this.gefilterteListen = this.listen.filter(liste =>
      liste.titel.toLowerCase().includes(such)
    );
  }

  // Formular öffnen/schließen
  oeffneFormular() {
    this.formularAktiv = true;
  }

  schliesseFormular() {
    this.formularAktiv = false;
    this.neueListe = { id: 0, titel: '', items: [{ name: '', menge: '' }] };
  }

  fuegeItemHinzu() {
    this.neueListe.items.push({ name: '', menge: '' });
  }

  entferneItem(index: number) {
    this.neueListe.items.splice(index, 1);
  }

  // Neue Liste speichern (POST ans Backend)
  speichereListe() {
    if (!this.neueListe.titel.trim()) return;

      const neueListePayload = {
      userId: this.userId,
      listName: this.neueListe.titel,
      items: this.neueListe.items.map(i => ({
        itemName: i.name,
        amount: i.menge,
        unit: ''
    }))
  };


    this.http.post(`${this.baseUrl}`, neueListePayload).subscribe({
      next: () => {
        this.zeigeSnackbar('Liste erfolgreich gespeichert!');
        this.schliesseFormular();
        this.ladeEinkaufslisten(); // ⬅️ direkt neu laden, damit die neue Liste erscheint
      },
      error: (err) => {
        console.error('Fehler beim Speichern:', err);
      }
    });
  }

  // Detailansicht
  zeigeDetails(liste: Einkaufsliste) {
    this.ausgewaehlteListe = liste;
    this.detailAktiv = true;
  }

  schliesseDetails() {
    this.detailAktiv = false;
    this.ausgewaehlteListe = null;
  }

  // Produkte in Liste bearbeiten
  fuegeProduktHinzu() {
    if (!this.neuesProdukt.trim()) return;
    this.ausgewaehlteListe?.items.push({
      name: this.neuesProdukt,
      menge: this.neueMenge || ''
    });
    this.neuesProdukt = '';
    this.neueMenge = '';
    this.zeigeSnackbar('Produkt hinzugefügt!');
  }

  loescheProdukt(index: number) {
    this.ausgewaehlteListe?.items.splice(index, 1);
  }

  bearbeiteProdukt(item: EinkaufslistenItem) {
    item.bearbeitung = true;
  }

  speichereProdukt(item: EinkaufslistenItem) {
    item.bearbeitung = false;
    this.zeigeSnackbar('Änderungen gespeichert!');
  }

  // Snackbar
  zeigeSnackbar(text: string) {
    this.snackbarText = text;
    this.snackbarAktiv = true;
    setTimeout(() => (this.snackbarAktiv = false), 2000);
  }
}
