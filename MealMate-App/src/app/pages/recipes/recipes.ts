import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface ZutatDto {
  zutat: string;
  menge: string | number;  // String für Input, wird später zu Number konvertiert
  einheit: string;
}

interface Rezept {
  id: number;
  titel: string;
  bild: string | null;
  zeit: string;
  portionen: string;
  beschreibung: string;
  anleitung: string;
  vegetarisch: boolean;
  vegan: boolean;
  zutaten: ZutatDto[];
}

@Component({
  selector: 'app-recipes',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './recipes.html',
  styleUrl: './recipes.css'
})
export class Recipes implements OnInit {
  private apiUrl = 'http://localhost:5000/api/recipes'; // Passe die URL an deinen Backend-Port an
  
  suchbegriff = '';
  filter_vegetarisch = false;
  filter_vegan = false;
  
  // Temporäre Variablen für das Formular
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.ladeRezepte();
  }

  ladeRezepte(): void {
    this.http.get<Rezept[]>(this.apiUrl).subscribe({
      next: (rezepte) => {
        this.rezepte = rezepte;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Rezepte:', error);
        alert('Fehler beim Laden der Rezepte. Stelle sicher, dass das Backend läuft.');
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
    if (this.ausgewaehltes_rezept) {
      // Deep Copy des Rezepts für die Bearbeitung
      this.bearbeitetes_rezept = JSON.parse(JSON.stringify(this.ausgewaehltes_rezept));
      
      // Zeit und Portionen extrahieren
      const zeitMatch = this.ausgewaehltes_rezept.zeit.match(/\d+/);
      const portionenMatch = this.ausgewaehltes_rezept.portionen.match(/\d+/);
      
      this.temp_bearbeitung_zeit = zeitMatch ? parseInt(zeitMatch[0]) : 0;
      this.temp_bearbeitung_portionen = portionenMatch ? parseInt(portionenMatch[0]) : 0;
      
      this.bearbeitungsmodus = true;
    }
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
        // Aktualisiere das Rezept in der Liste
        const index = this.rezepte.findIndex(r => r.id === gespeichertesRezept.id);
        if (index !== -1) {
          this.rezepte[index] = gespeichertesRezept;
        }
        
        // Aktualisiere die Detailansicht
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
      titel: this.neues_rezept.titel.trim(),
      bild: this.neues_rezept.bild || null,
      zeit: this.temp_zeit > 0 ? `${this.temp_zeit} Min` : '0 Min',
      portionen: this.temp_portionen > 0 ? `${this.temp_portionen} Portionen` : '0 Portionen',
      beschreibung: this.neues_rezept.beschreibung.trim(),
      anleitung: this.neues_rezept.anleitung.trim(),
      vegetarisch: this.neues_rezept.vegetarisch,
      vegan: this.neues_rezept.vegan,
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
      titel: '',
      bild: null,
      zeit: '',
      portionen: '',
      beschreibung: '',
      anleitung: '',
      vegetarisch: false,
      vegan: false,
      zutaten: [{ zutat: '', menge: '', einheit: '' }]
    };
  }
}