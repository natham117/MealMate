import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';

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
    next: (res: any) => {
      console.log('✅ Liste erfolgreich gespeichert:', res);

      // Falls das Backend eine ListId zurückgibt → gleich lokal hinzufügen
      if (res?.listId) {
        this.listen.unshift({
          listId: res.listId,
          userId: this.userId,
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
// oeffneRenameDialog(liste: ShoppingListData): void {
//   const neuerName = prompt("Neuer Listenname:", liste.listName);
//   if (!neuerName || !neuerName.trim()) return;

//   this.http.put(`${this.baseUrl}/${liste.listId}`, { newName: neuerName.trim() }).subscribe({
//     next: () => {
//       this.zeigeSnackbar('Liste umbenannt!');
//       liste.listName = neuerName.trim();
//     },
//     error: () => this.zeigeSnackbar('Fehler beim Umbenennen!')
//   });
// }
// bestaetigeLoeschen(liste: ShoppingListData): void {
//   const sicher = confirm(`Willst du die Liste "${liste.listName}" wirklich löschen?`);
//   if (!sicher) return;

//   this.http.delete(`${this.baseUrl}/${liste.listId}`).subscribe({
//     next: () => {
//       this.listen = this.listen.filter(l => l.listId !== liste.listId);
//       this.gefilterteListen = this.gefilterteListen.filter(l => l.listId !== liste.listId);
//       this.zeigeSnackbar('Liste gelöscht!');
//     },
//     error: () => this.zeigeSnackbar('Fehler beim Löschen!')
//   });
// }
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
      this.zeigeSnackbar('Fehler beim Löschen!');
    }
  });
}



}
