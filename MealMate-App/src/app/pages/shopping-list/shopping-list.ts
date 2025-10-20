import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface ShoppingItem {
  itemId?: number;
  itemName: string;
  amount: number;
  unit: string;
  bearbeitung?: boolean;
}

// 👇 Interface umbenannt, damit es sich nicht mit der Component beißt
interface ShoppingListData {
  listId?: number;
  userId?: number;
  listName: string;
  items: ShoppingItem[];
}

@Component({
  selector: 'shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './shopping-list.html',
  styleUrl: './shopping-list.css'
})
export class ShoppingList implements OnInit {
  private baseUrl = 'http://localhost:5000/api/shoppinglist';
  private userId = 2;

  suchbegriff = '';
  listen: ShoppingListData[] = [];
  gefilterteListen: ShoppingListData[] = [];

  formularAktiv = false;
  detailAktiv = false;

  neueListe: ShoppingListData = this.leereListe(); // ✅ jetzt richtiger Typ
  ausgewaehlteListe: ShoppingListData | null = null;

  neuesProdukt = '';
  neueMenge: number | null = null;
  neueEinheit = '';

  snackbarText = '';
  snackbarAktiv = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.ladeEinkaufslisten();
  }

  // ------------------------------------------------------------
  // 🧩 Listen vom Backend laden
  // ------------------------------------------------------------
  ladeEinkaufslisten(): void {
    this.http.get<any[]>(`${this.baseUrl}/${this.userId}`).subscribe({
      next: (data) => {
        this.listen = (data || []).map((l: any) => ({
          listId: l.listId ?? l.ListId ?? l.LIST_ID ?? 0,
          userId: l.userId ?? l.UserId ?? l.USER_ID ?? this.userId,
          listName: l.listName ?? l.ListName ?? l.LIST_NAME ?? '',
          items: (l.items ?? l.Items ?? l.ITEMS ?? []).map((i: any) => ({
            itemId: i.itemId ?? i.ItemId ?? i.ITEM_ID ?? 0,
            itemName: i.itemName ?? i.ItemName ?? i.ITEM_NAME ?? '',
            amount: Number(i.amount ?? i.Amount ?? i.AMOUNT ?? 0),
            unit: i.unit ?? i.Unit ?? i.UNIT ?? ''
          }))
        }));

        this.gefilterteListen = [...this.listen];
        console.log('✅ Einkaufslisten geladen:', this.listen);
      },
      error: (err) => {
        console.error('❌ Fehler beim Laden der Listen:', err);
        this.zeigeSnackbar('Fehler beim Laden der Listen!');
      }
    });
  }

  // ------------------------------------------------------------
  // 🔍 Suchfunktion
  // ------------------------------------------------------------
  filtereListen(): void {
    const such = this.suchbegriff.toLowerCase();
    this.gefilterteListen = this.listen.filter(l =>
      l.listName.toLowerCase().includes(such)
    );
  }

  // ------------------------------------------------------------
  // ➕ Neue Liste anlegen
  // ------------------------------------------------------------
  oeffneFormular(): void {
    this.neueListe = this.leereListe();
    this.formularAktiv = true;
  }

  schliesseFormular(): void {
    this.formularAktiv = false;
    this.neueListe = this.leereListe();
  }

  fuegeItemHinzu(): void {
    this.neueListe.items.push({ itemName: '', amount: 0, unit: '' });
  }

  entferneItem(index: number): void {
    this.neueListe.items.splice(index, 1);
  }

  speichereListe(): void {
    if (!this.neueListe.listName.trim()) {
      this.zeigeSnackbar('Bitte gib einen Listennamen ein!');
      return;
    }

    const payload = {
      UserId: this.userId,
      ListName: this.neueListe.listName.trim(),
      Items: this.neueListe.items.map(i => ({
        ItemName: i.itemName.trim(),
        Amount: Number(i.amount) || 0,
        Unit: i.unit.trim() || ''
      }))
    };


    console.log('📤 Sende Payload:', payload);

    this.http.post(`${this.baseUrl}`, payload).subscribe({
      next: (res) => {
        console.log('✅ Antwort vom Server:', res);
        this.zeigeSnackbar('Liste erfolgreich gespeichert!');
        this.schliesseFormular();
        this.ladeEinkaufslisten();
      },
      error: (err) => {
        console.error('❌ Fehler beim Speichern:', err);
        this.zeigeSnackbar('Fehler beim Speichern!');
      }
    });
  }

  // ------------------------------------------------------------
  // 📋 Detailansicht
  // ------------------------------------------------------------
  zeigeDetails(liste: ShoppingListData): void {
    this.ausgewaehlteListe = liste;
    this.detailAktiv = true;
  }

  schliesseDetails(): void {
    this.detailAktiv = false;
    this.ausgewaehlteListe = null;
  }

  // fuegeProduktHinzu(): void {
  //   if (!this.neuesProdukt.trim()) return;
  //   const neuesItem: ShoppingItem = {
  //     itemName: this.neuesProdukt.trim(),
  //     amount: this.neueMenge ?? 0,
  //     unit: this.neueEinheit.trim()
  //   };
  //   this.ausgewaehlteListe?.items.push(neuesItem);
  //   this.neuesProdukt = '';
  //   this.neueMenge = null;
  //   this.neueEinheit = '';
  //   this.zeigeSnackbar('Produkt hinzugefügt!');
  // }
  fuegeProduktHinzu() {
  if (!this.ausgewaehlteListe) return;
  if (!this.neuesProdukt.trim()) {
    this.zeigeSnackbar('❌ Bitte gib einen Produktnamen ein!');
    return;
  }

  const payload = {
  itemId: this.ausgewaehlteListe.listId, // ⬅️ das ist die LIST_ID!
  itemName: this.neuesProdukt.trim(),
  amount: this.neueMenge ?? 0,
  unit: this.neueEinheit.trim(),
  category: '' // optional, weil Base-Klasse es verlangt
  };


  this.http.post(`${this.baseUrl}/item`, payload).subscribe({
    next: () => {
      // Direkt in der Liste anzeigen
      this.ausgewaehlteListe!.items.push({
        itemName: payload.itemName,
        amount: payload.amount,
        unit: payload.unit
      });

      this.zeigeSnackbar('✅ Produkt erfolgreich hinzugefügt!');
      this.neuesProdukt = '';
      this.neueMenge = null;
      this.neueEinheit = '';
    },
    error: (err) => {
      console.error('Fehler beim Hinzufügen:', err);
      
      // 💡 Zeige den Fehler hübsch in der Snackbar
      const msg =
        err.status === 0
          ? '⚠️ Keine Verbindung zum Server!'
          : `❌ Fehler beim Hinzufügen (${err.status}): ${err.error?.message ?? 'Unbekannter Fehler'}`;
      this.zeigeSnackbar(msg);
    }
  });
}


  loescheProdukt(index: number): void {
  if (!this.ausgewaehlteListe) return;

  const item = this.ausgewaehlteListe.items[index];
  if (!item) return;

  const listId = this.ausgewaehlteListe.listId;
  const itemName = item.itemName;

  this.http.delete(`${this.baseUrl}/item`, {
  params: {
    listId: String(listId),
    itemName: String(itemName)
  }
  }).subscribe({
    next: () => {
      this.ausgewaehlteListe!.items.splice(index, 1);
      this.zeigeSnackbar(`'${itemName}' wurde gelöscht!`);
    },
    error: (err) => {
      console.error('Fehler beim Löschen:', err);
      this.zeigeSnackbar('❌ Fehler beim Löschen!');
    }
  });
}

  // ------------------------------------------------------------
  // 🔔 Snackbar & Hilfsfunktionen
  // ------------------------------------------------------------
  zeigeSnackbar(text: string): void {
    this.snackbarText = text;
    this.snackbarAktiv = true;
    setTimeout(() => (this.snackbarAktiv = false), 2000);
  }

  private leereListe(): ShoppingListData {
    return {
      listName: '',
      items: [{ itemName: '', amount: 0, unit: '' }]
    };
  }
  bearbeiteProdukt(item: any) {
  item.bearbeitung = true;
}

speichereProdukt(item: any) {
  if (!this.ausgewaehlteListe) return;

  const payload = {
    listId: this.ausgewaehlteListe.listId,
    itemName: item.itemName,
    amount: item.amount,
    unit: item.unit,
  };

  this.http.put(`${this.baseUrl}/item`, payload).subscribe({
    next: () => {
      item.bearbeitung = false;
      this.zeigeSnackbar('Änderungen gespeichert!');
    },
    error: (err) => {
      console.error('Fehler beim Speichern:', err);
      this.zeigeSnackbar('❌ Fehler beim Speichern!');
    },
  });
}

}
