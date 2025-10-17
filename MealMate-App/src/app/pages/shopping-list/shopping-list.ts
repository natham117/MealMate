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
      userId: this.userId,
      listName: this.neueListe.listName.trim(),
      items: this.neueListe.items
        .filter(i => i.itemName.trim() !== '')
        .map(i => ({
          itemName: i.itemName.trim(),
          amount: Number(i.amount) || 0,
          unit: i.unit.trim() || ''
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

  fuegeProduktHinzu(): void {
    if (!this.neuesProdukt.trim()) return;
    const neuesItem: ShoppingItem = {
      itemName: this.neuesProdukt.trim(),
      amount: this.neueMenge ?? 0,
      unit: this.neueEinheit.trim()
    };
    this.ausgewaehlteListe?.items.push(neuesItem);
    this.neuesProdukt = '';
    this.neueMenge = null;
    this.neueEinheit = '';
    this.zeigeSnackbar('Produkt hinzugefügt!');
  }

  loescheProdukt(index: number): void {
    this.ausgewaehlteListe?.items.splice(index, 1);
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
}
