import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { AuthService } from '../../auth/login/auth.service';

interface ShoppingItem {
  groceryListItemId?: number;
  itemId?: number;
  itemName: string;
  amount: number;
  unit: string;
  isChecked?: boolean;
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
  private userId: number | null = null;


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

  constructor(private http: HttpClient, public authService: AuthService) {}

  ngOnInit(): void {
  this.userId = this.authService.getUserId();

  if (!this.userId) {
    console.error('⚠️ Kein User eingeloggt – keine Listen geladen.');
    return;
  }

  this.http.get<any[]>(`${this.baseUrl}/${this.userId}`).subscribe({
    next: (data) => {
      this.listen = this.mapLists(data);
      this.gefilterteListen = [...this.listen];
    },
    error: (err) => { /* ... */ }
  });

  // this.http.get<ShoppingListData[]>(`${this.baseUrl}/${this.userId}`).subscribe({
  //   next: (listen) => {
  //     this.listen = listen;
  //     this.gefilterteListen = [...listen];
  //   },
  //   error: (err) => {
  //     console.error('Fehler beim Laden der Listen:', err);
  //     this.zeigeSnackbar('Fehler beim Laden deiner Einkaufslisten.');
  //   }
  // });
}

  
  // ------------------------------------------------------------
  // 🧩 Listen vom Backend laden
  // ------------------------------------------------------------
  ladeEinkaufslisten(): void {
    if (!this.userId) {
      console.warn('⚠️ Kein User eingeloggt.');
      return;
    }

    this.http.get<any[]>(`${this.baseUrl}/${this.userId}`).subscribe({
  next: (data) => {
    this.listen = this.mapLists(data);
    this.gefilterteListen = [...this.listen];

    // Optional: aktuell geöffnete Liste wiederfinden
    if (this.ausgewaehlteListe?.listId) {
      const id = this.ausgewaehlteListe.listId;
      const refreshed = this.listen.find(l => l.listId === id);
      if (refreshed) this.ausgewaehlteListe = refreshed;
    }
  },
  error: (err) => { /* … */ }
});

    // this.http.get<any[]>(`${this.baseUrl}/${this.userId}`).subscribe({
    //   next: (data) => {
    //     this.listen = (data || []).map((l: any) => ({
    //       listId: l.listId ?? l.ListId ?? l.LIST_ID ?? 0,
    //       userId: l.userId ?? l.UserId ?? l.USER_ID ?? this.userId,
    //       listName: l.listName ?? l.ListName ?? l.LIST_NAME ?? '',
    //       items: (l.items ?? l.Items ?? l.ITEMS ?? []).map((i: any) => ({
    //         itemId: i.itemId ?? i.ItemId ?? i.ITEM_ID ?? 0,
    //         itemName: i.itemName ?? i.ItemName ?? i.ITEM_NAME ?? '',
    //         amount: Number(i.amount ?? i.Amount ?? i.AMOUNT ?? 0),
    //         unit: i.unit ?? i.Unit ?? i.UNIT ?? ''
    //       }))
    //     }));

    //     this.gefilterteListen = [...this.listen];
    //     console.log('✅ Einkaufslisten geladen:', this.listen);
    //   },
    //   error: (err) => {
    //     console.error('❌ Fehler beim Laden der Listen:', err);
    //     this.zeigeSnackbar('Fehler beim Laden der Listen!');
    //   }
    // });
  }



  private asBool(v: any): boolean {
    if(typeof v === 'boolean') return v;
    if(typeof v === 'number') return v === 1;
    if(typeof v === 'string') return v === '1' || v.toLowerCase() === 'true';
    return false;
  }

  private mapItem = (i: any): ShoppingItem => ({
    groceryListItemId: i.groceryListItemId ?? i.GroceryListItemId ?? i.GROCERY_LIST_ITEM_ID ?? 0,
    itemId:            i.itemId ?? i.ItemId ?? i.ITEM_ID ?? 0,
    itemName:          i.itemName ?? i.ItemName ?? i.ITEM_NAME ?? '',
    amount:            Number(i.amount ?? i.Amount ?? i.AMOUNT ?? 0),
    unit:              i.unit ?? i.Unit ?? i.UNIT ?? '',
    isChecked:         this.asBool(i.isChecked ?? i.IsChecked ?? i.IS_CHECKED ?? 0),
  });

  private mapList = (l: any): ShoppingListData => ({
    listId:   l.listId ?? l.ListId ?? l.LIST_ID ?? 0,
    userId:   l.userId ?? l.UserId ?? l.USER_ID ?? this.userId ?? 0,
    listName: l.listName ?? l.ListName ?? l.LIST_NAME ?? '',
    items:    (l.items ?? l.Items ?? l.ITEMS ?? []).map(this.mapItem),
  });

  private mapLists = (data: any[]): ShoppingListData[] =>
  (data || []).map(this.mapList);



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
  if (!this.userId) {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      this.zeigeSnackbar('⚠️ Kein Benutzer gefunden. Bitte neu einloggen.');
      return;
    }
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
    next: (res: any) => {
      console.log('✅ Liste erfolgreich gespeichert:', res);

      // Falls das Backend eine ListId zurückgibt → gleich lokal hinzufügen
      if (res?.listId) {
        this.listen.unshift({
          listId: res.listId,
          userId: this.userId!,
          listName: this.neueListe.listName.trim(),
          items: this.neueListe.items
        });
      }

      this.zeigeSnackbar('🛒 Einkaufsliste erfolgreich erstellt!');
      this.schliesseFormular();

      // Optional: komplette Liste nochmal vom Server ziehen
      this.ladeEinkaufslisten();
    },
    error: (err) => {
      console.error('❌ Fehler beim Speichern:', err);
      // Snackbar mit dem genauen Fehlertext aus dem Backend
      const msg = err?.error?.message || 'Fehler beim Erstellen der Liste!';
      this.zeigeSnackbar(`⚠️ ${msg}`);
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
  this.zeigeSnackbar('✅ Produkt erfolgreich hinzugefügt!');
  this.neuesProdukt = '';
  this.neueMenge = null;
  this.neueEinheit = '';

  // Liste(n) neu laden, damit groceryListItemId & isChecked vorhanden sind
  const currentId = this.ausgewaehlteListe?.listId;
  this.ladeEinkaufslisten();

  // Ausgewählte Liste nach Reload wiederherstellen
  if (currentId) {
    setTimeout(() => {
      const neu = this.listen.find(l => l.listId === currentId);
      if (neu) this.ausgewaehlteListe = neu;
    }, 0);
  }
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
//Liste umbenennen und so
renameAktiv = false;
listeZumUmbenennen: ShoppingListData | null = null;
neuerListenname = '';

oeffneRenameDialog(liste: ShoppingListData): void {
  this.listeZumUmbenennen = liste;
  this.neuerListenname = liste.listName;
  this.renameAktiv = true;
}

schliesseRenameDialog(): void {
  this.renameAktiv = false;
  this.listeZumUmbenennen = null;
  this.neuerListenname = '';
}

speichereRename(): void {
  if (!this.listeZumUmbenennen || !this.neuerListenname.trim()) {
    this.zeigeSnackbar('Bitte gib einen gültigen Namen ein!');
    return;
  }

  const payload = { newName: this.neuerListenname.trim() };
  const listId = this.listeZumUmbenennen.listId;

  this.http.put(`${this.baseUrl}/${listId}`, payload).subscribe({
    next: () => {
      this.listeZumUmbenennen!.listName = this.neuerListenname.trim();
      this.zeigeSnackbar('Listenname erfolgreich geändert!');
      this.schliesseRenameDialog();
    },
    error: (err) => {
      console.error('Fehler beim Umbenennen:', err);
      this.zeigeSnackbar('Fehler beim Umbenennen!');
    }
  });
}
deleteAktiv: boolean = false;
zuLoeschendeListe: ShoppingListData | null = null;
bestaetigeLoeschen(liste: ShoppingListData) {
  this.zuLoeschendeListe = liste;
  this.deleteAktiv = true;
}

schliesseDeleteDialog() {
  this.deleteAktiv = false;
  this.zuLoeschendeListe = null;
}

bestaetigeDelete() {
  if (!this.zuLoeschendeListe) return;

  const listId = this.zuLoeschendeListe.listId;

  this.http.delete(`${this.baseUrl}/${listId}`).subscribe({
    next: () => {
      this.gefilterteListen = this.gefilterteListen.filter(
        (l) => l.listId !== listId
      );
      this.zeigeSnackbar('Liste erfolgreich gelöscht!');
      this.schliesseDeleteDialog();
    },
    error: (err) => {
      console.error('Fehler beim Löschen:', err);
      //this.zeigeSnackbar('Fehler beim Löschen!');

      if (err.status === 404) {
        console.warn('Liste war wohl nur lokal – entferne sie manuell.');
        this.gefilterteListen = this.gefilterteListen.filter(l => l.listId !== listId);
        this.zeigeSnackbar('Liste war nicht in der Datenbank – wurde lokal entfernt.');
        this.schliesseDeleteDialog();
      } else {
        this.zeigeSnackbar('Fehler beim Löschen!');
      }
    }
  });
}

pdfLaedt = false;

ladePdf(listeId?: number, titel?: string) {
  this.pdfLaedt = true;
  this.http.get(`${this.baseUrl}/${listeId}/pdf`, {
    responseType: 'blob',
    observe: 'response'
  }).subscribe({
    next: res => {
      const blob = res.body!;
      let filename = 'einkaufsliste.pdf';
      const cd = res.headers.get('Content-Disposition');
      const m = cd?.match(/filename="?([^"]+)"?/i);
      if (m?.[1]) filename = m[1];
      else if (titel) filename = `${titel.replace(/[\\/:*?"<>|]+/g, '_')}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    error: err => {
      console.error('PDF-Download fehlgeschlagen:', err);
      alert('PDF konnte nicht erstellt werden.');
    },
    complete: () => this.pdfLaedt = false
  });
}

onToggleItem(list: ShoppingListData, item: ShoppingItem, checked: boolean): void {
  if (!list.listId || !item.groceryListItemId) {
    console.warn('Kein listId oder groceryListItemId vorhanden – reloading list.');
    // Fallback: Liste neu laden
    this.ladeEinkaufslisten();
    return;
  }

  const prev = !!item.isChecked;
  item.isChecked = checked; // Optimistic UI

  this.http.patch(`${this.baseUrl}/${list.listId}/items/${item.groceryListItemId}`, { isChecked: checked })
    .subscribe({
      next: () => {},
      error: (err) => {
        console.error('PATCH fehlgeschlagen:', err);
        item.isChecked = prev; // Rollback
        this.zeigeSnackbar('❌ Konnte Status nicht speichern.');
      }
    });
}

trackByItem = (_: number, it: { groceryListItemId?: number; itemId?: number }) =>
  it.groceryListItemId ?? it.itemId ?? _;



}
