import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
  zutaten: string[];
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
  
  neues_rezept: Rezept = this.leeres_rezept();
  formular_aktiv = false;

  rezepte: Rezept[] = [];
  ausgewaehltes_rezept: Rezept | null = null;
  modal_aktiv = false;

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
  }

  oeffneFormular(): void {
    this.neues_rezept = this.leeres_rezept();
    this.formular_aktiv = true;
  }

  schliesseFormular(): void {
    this.formular_aktiv = false;
    this.neues_rezept = this.leeres_rezept();
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
      zeit: this.neues_rezept.zeit.trim() || '0 Min',
      portionen: this.neues_rezept.portionen.trim() || '0 Portionen',
      beschreibung: this.neues_rezept.beschreibung.trim(),
      anleitung: this.neues_rezept.anleitung.trim(),
      vegetarisch: this.neues_rezept.vegetarisch,
      vegan: this.neues_rezept.vegan,
      zutaten: this.neues_rezept.zutaten.filter(z => z.trim())
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
    this.neues_rezept.zutaten.push('');
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
      zutaten: ['']
    };
  }
}