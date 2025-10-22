import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/login/auth.service';

interface ZutatDto {
  zutat: string;
  menge: string | number;
  einheit: string;
}

interface Rezept {
  id: number;
  userId: number;
  titel: string;
  bild: string | null;
  zeit: string;
  portionen: string;
  beschreibung: string;
  anleitung: string;
  vegetarisch: boolean;
  vegan: boolean;
  istFavorit: boolean;
  zutaten: ZutatDto[];
}

@Component({
  selector: 'app-recipes',
  imports: [CommonModule, FormsModule],
  templateUrl: './recipes.html',
  styleUrl: './recipes.css'
})
export class Recipes implements OnInit {
  private apiUrl = 'http://localhost:5000/api/recipes';
  
  suchbegriff = '';
  filter_vegetarisch = false;
  filter_vegan = false;
  filter_favoriten = false;
  filter_eigene_rezepte = false;
  
  temp_zeit = 0;
  temp_portionen = 0;
  
  neues_rezept: Rezept = this.leeres_rezept();
  formular_aktiv = false;

  rezepte: Rezept[] = [];
  ausgewaehltes_rezept: Rezept | null = null;
  modal_aktiv = false;
  
  bearbeitungsmodus = false;
  bearbeitetes_rezept: Rezept | null = null;
  temp_bearbeitung_zeit = 0;
  temp_bearbeitung_portionen = 0;

  constructor(private http: HttpClient, public authService: AuthService) {}

  // ESC-Taste Handler
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    // Priorität: Bearbeitungsmodus > Detailansicht > Neues Rezept
    if (this.bearbeitungsmodus) {
      this.abbrechenBearbeitung();
    } else if (this.modal_aktiv) {
      this.schliesseModal();
    } else if (this.formular_aktiv) {
      this.schliesseFormular();
    }
  }

  ngOnInit(): void {
    console.log('🔄 [Recipes] Komponente wird initialisiert');
    console.log('🔍 [Recipes] User-ID aus localStorage:', localStorage.getItem('userId'));
    this.ladeRezepte();
  }

  ladeRezepte(): void {
    console.log('📥 [Recipes] Lade Rezepte...');
    this.http.get<Rezept[]>(this.apiUrl).subscribe({
      next: (rezepte) => {
        console.log('✅ [Recipes] Rezepte geladen:', rezepte.length);
        this.rezepte = rezepte;
      },
      error: (error) => {
        console.error('❌ [Recipes] Fehler beim Laden:', error);
        if (error.status === 401) {
          alert('Bitte zuerst einloggen!');
        } else {
          alert('Fehler beim Laden der Rezepte.');
        }
      }
    });
  }

  get gefilterte_rezepte(): Rezept[] {
    let gefiltert = this.rezepte;
    
    // Nach Titel filtern
    if (this.suchbegriff.trim()) {
      const suche = this.suchbegriff.toLowerCase();
      gefiltert = gefiltert.filter(rezept => 
        rezept.titel.toLowerCase().includes(suche)
      );
    }
    
    // Nach Vegetarisch filtern
    if (this.filter_vegetarisch) {
      gefiltert = gefiltert.filter(rezept => rezept.vegetarisch);
    }
    
    // Nach Vegan filtern
    if (this.filter_vegan) {
      gefiltert = gefiltert.filter(rezept => rezept.vegan);
    }
    
    // Nach Favoriten filtern
    if (this.filter_favoriten) {
      gefiltert = gefiltert.filter(rezept => rezept.istFavorit);
    }
    
    // Nach eigene Rezepte filtern
    if (this.filter_eigene_rezepte) {
      const currentUserId = this.authService.getUserId();
      if (currentUserId) {
        gefiltert = gefiltert.filter(rezept => rezept.userId === currentUserId);
        console.log(`🔍 [Recipes] Filter "Eigene Rezepte": ${gefiltert.length} von ${this.rezepte.length}`);
      }
    }
    
    return gefiltert;
  }

  zeigeDetails(rezept: Rezept): void {
    this.ausgewaehltes_rezept = rezept;
    this.modal_aktiv = true;
  }

  schliesseModal(): void {
    this.modal_aktiv = false;
    this.ausgewaehltes_rezept = null;
    this.bearbeitungsmodus = false;
    this.bearbeitetes_rezept = null;
  }

  starteBearbeitung(): void {
    if (!this.ausgewaehltes_rezept) return;

    // Prüfe ob User eingeloggt ist
    const currentUserId = this.authService.getUserId();
    if (!currentUserId) {
      alert('Bitte zuerst einloggen, um Rezepte zu bearbeiten!');
      return;
    }

    // Prüfe ob das Rezept dem aktuellen User gehört
    if (this.ausgewaehltes_rezept.userId !== currentUserId) {
      alert('Du kannst nur deine eigenen Rezepte bearbeiten!');
      return;
    }

    this.bearbeitetes_rezept = JSON.parse(JSON.stringify(this.ausgewaehltes_rezept));
    
    const zeitMatch = this.ausgewaehltes_rezept.zeit.match(/\d+/);
    const portionenMatch = this.ausgewaehltes_rezept.portionen.match(/\d+/);
    
    this.temp_bearbeitung_zeit = zeitMatch ? parseInt(zeitMatch[0]) : 0;
    this.temp_bearbeitung_portionen = portionenMatch ? parseInt(portionenMatch[0]) : 0;
    
    this.bearbeitungsmodus = true;
  }

  abbrechenBearbeitung(): void {
    this.bearbeitungsmodus = false;
    this.bearbeitetes_rezept = null;
  }

  speichereBearbeitung(): void {
    if (!this.bearbeitetes_rezept) return;

    const aktualisiertes_rezept: Rezept = {
      ...this.bearbeitetes_rezept,
      zeit: this.temp_bearbeitung_zeit > 0 ? `${this.temp_bearbeitung_zeit} Min` : '0 Min',
      portionen: this.temp_bearbeitung_portionen > 0 ? `${this.temp_bearbeitung_portionen} Portionen` : '0 Portionen',
      zutaten: this.bearbeitetes_rezept.zutaten.filter(z => z.zutat.trim() !== '')
    };

    this.http.put<Rezept>(`${this.apiUrl}/${aktualisiertes_rezept.id}`, aktualisiertes_rezept).subscribe({
      next: (gespeichertesRezept) => {
        const index = this.rezepte.findIndex(r => r.id === gespeichertesRezept.id);
        if (index !== -1) {
          this.rezepte[index] = gespeichertesRezept;
        }
        
        this.ausgewaehltes_rezept = gespeichertesRezept;
        this.bearbeitungsmodus = false;
        this.bearbeitetes_rezept = null;
      },
      error: (error) => {
        console.error('Fehler beim Speichern:', error);
        alert('Fehler beim Speichern des Rezepts');
      }
    });
  }

  fuegeBearbeitungsZutatHinzu(): void {
    if (this.bearbeitetes_rezept) {
      this.bearbeitetes_rezept.zutaten.push({ zutat: '', menge: '', einheit: '' });
    }
  }

  entferneBearbeitungsZutat(index: number): void {
    if (this.bearbeitetes_rezept) {
      this.bearbeitetes_rezept.zutaten.splice(index, 1);
    }
  }

  onVeganChange(): void {
    if (this.neues_rezept.vegan) {
      this.neues_rezept.vegetarisch = true;
    }
  }

  onBearbeitungVeganChange(): void {
    if (this.bearbeitetes_rezept && this.bearbeitetes_rezept.vegan) {
      this.bearbeitetes_rezept.vegetarisch = true;
    }
  }

  toggleFavorit(): void {
    if (!this.ausgewaehltes_rezept) return;

    const userId = this.authService.getUserId();
    if (!userId) {
      alert('Bitte zuerst einloggen, um Favoriten zu setzen!');
      return;
    }

    const rezeptId = this.ausgewaehltes_rezept.id;
    const neuerStatus = !this.ausgewaehltes_rezept.istFavorit;

    console.log(`🌟 [Recipes] Favorit ${neuerStatus ? 'setzen' : 'entfernen'} für Rezept ${rezeptId}`);

    this.http.post(`${this.apiUrl}/${rezeptId}/favorite`, { isFavorite: neuerStatus }).subscribe({
      next: () => {
        console.log('✅ [Recipes] Favorit erfolgreich gesetzt');
        if (this.ausgewaehltes_rezept) {
          this.ausgewaehltes_rezept.istFavorit = neuerStatus;
        }
        const rezeptInListe = this.rezepte.find(r => r.id === rezeptId);
        if (rezeptInListe) {
          rezeptInListe.istFavorit = neuerStatus;
        }
      },
      error: (error) => {
        console.error('❌ [Recipes] Fehler beim Setzen des Favoriten:', error);
        if (error.status === 401) {
          alert('Bitte zuerst einloggen!');
        } else {
          alert('Fehler beim Setzen des Favoriten-Status');
        }
      }
    });
  }

  oeffneFormular(): void {
    this.neues_rezept = this.leeres_rezept();
    this.temp_zeit = 0;
    this.temp_portionen = 0;
    this.formular_aktiv = true;
  }

  schliesseFormular(): void {
    this.formular_aktiv = false;
    this.neues_rezept = this.leeres_rezept();
    this.temp_zeit = 0;
    this.temp_portionen = 0;
  }

  speichereRezept(): void {
    if (!this.neues_rezept.titel.trim()) {
      alert('Bitte gib einen Rezeptnamen ein!');
      return;
    }

    const rezept: Rezept = {
      id: 0,
      userId: 0,  // Wird vom Backend gesetzt
      titel: this.neues_rezept.titel.trim(),
      bild: this.neues_rezept.bild || null,
      zeit: this.temp_zeit > 0 ? `${this.temp_zeit} Min` : '0 Min',
      portionen: this.temp_portionen > 0 ? `${this.temp_portionen} Portionen` : '0 Portionen',
      beschreibung: this.neues_rezept.beschreibung.trim(),
      anleitung: this.neues_rezept.anleitung.trim(),
      vegetarisch: this.neues_rezept.vegetarisch,
      vegan: this.neues_rezept.vegan,
      istFavorit: false,
      zutaten: this.neues_rezept.zutaten.filter(z => z.zutat.trim() !== '')
    };

    this.http.post<Rezept>(this.apiUrl, rezept).subscribe({
      next: (gespeichertesRezept) => {
        this.rezepte.unshift(gespeichertesRezept);
        this.schliesseFormular();
      },
      error: (error) => {
        console.error('Fehler beim Speichern:', error);
        alert('Fehler beim Speichern des Rezepts');
      }
    });
  }

  fuegeZutatHinzu(): void {
    this.neues_rezept.zutaten.push({ zutat: '', menge: '', einheit: '' });
  }

  entferneZutat(index: number): void {
    this.neues_rezept.zutaten.splice(index, 1);
  }

  private leeres_rezept(): Rezept {
    return {
      id: 0,
      userId: 0,
      titel: '',
      bild: null,
      zeit: '',
      portionen: '',
      beschreibung: '',
      anleitung: '',
      vegetarisch: false,
      vegan: false,
      istFavorit: false,
      zutaten: [{ zutat: '', menge: '', einheit: '' }]
    };
  }

  pdfLaedt = false;
  private pdfLaedtIds = new Set<number>();

  laedtPdf(id: number) { return this.pdfLaedtIds.has(id); }

  ladePdf(rezeptId: number, titel?: string, ev?: Event) {
    ev?.stopPropagation();
    this.pdfLaedt = true;
    this.pdfLaedtIds.add(rezeptId);

    this.http.get(`${this.apiUrl}/${rezeptId}/pdf`, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: res => {
        const blob = res.body!;
        let filename = this.extractFilename(res.headers.get('Content-Disposition'))
                      ?? (titel ? `${this.sanitize(titel)}.pdf` : 'rezept.pdf');

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      error: err => {
        console.error('PDF-Download fehlgeschlagen:', err);
        alert('PDF konnte nicht erstellt werden.');
      }, 
      complete: () => {
        this.pdfLaedt = false;
        this.pdfLaedtIds.delete(rezeptId);
      }
    });
  }

  private extractFilename(cd: string | null): string | null {
    if(!cd) return null;
    const utf8 = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(cd);
    if(utf8?.[1]) return decodeURIComponent(utf8[1]);
    const simple = /filename="?([^"]+)"?/i.exec(cd);
    return simple?.[1] ?? null;
  }

  private sanitize(name: string): string {
    return name.replace(/[\\/:*?"<>|]+/g, '_').trim();
  }
}