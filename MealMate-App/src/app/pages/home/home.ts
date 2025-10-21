import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface ZutatDto {
  zutat: string;
  menge: string | number;
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
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  searchQuery: string = '';
  recipeOfTheDay: Rezept | null = null;
  private apiUrl = 'http://localhost:5000/api/recipes';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRecipeOfTheDay();
  }

  clearSearch() {
    this.searchQuery = '';
  }

  loadRecipeOfTheDay(): void {
    this.http.get<Rezept[]>(this.apiUrl).subscribe({
      next: (rezepte) => {
        // Harte Auswahl: Rezept mit ID 14 (User-ID ist hier irrelevant)
        const rezept = rezepte.find((r) => r.id === 14);

        if (rezept) {
          this.recipeOfTheDay = rezept;
          console.log('Rezept des Tages:', rezept);
        } else {
          console.warn('Kein Rezept mit ID 14 gefunden.');
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Rezepte:', error);
        alert('Fehler beim Laden der Rezepte. Stelle sicher, dass das Backend läuft.');
      }
    });
  }
}
