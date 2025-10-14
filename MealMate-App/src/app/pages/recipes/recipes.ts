import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Rezept {
  id: number;
  titel: string;
  bild: string | null;
  zeit: string;
  portionen: string;
  beschreibung: string;
  zutaten: string[];
}

@Component({
  selector: 'app-recipes',
  imports: [CommonModule, FormsModule],
  templateUrl: './recipes.html',
  styleUrl: './recipes.css'
})
export class Recipes {
  suchbegriff = '';
  
  neues_rezept: Rezept = this.leeres_rezept();
  formular_aktiv = false;
  rezepte: Rezept[] = [
    {
      id: 1,
      titel: 'Spaghetti Carbonara',
      bild: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
      zeit: '25 Min',
      portionen: '4 Portionen',
      beschreibung: 'Ein klassisches italienisches Pasta-Gericht mit cremiger Sauce aus Eiern, Parmesan und knusprigem Speck.',
      zutaten: ['400g Spaghetti', '200g Pancetta oder Speck', '4 Eier', '100g Parmesan', 'Salz & Pfeffer']
    },
    {
      id: 2,
      titel: 'Gemüsecurry',
      bild: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
      zeit: '35 Min',
      portionen: '3 Portionen',
      beschreibung: 'Ein aromatisches vegetarisches Curry mit buntem Gemüse und Kokosmilch. Perfekt mit Reis oder Naan-Brot.',
      zutaten: ['1 Blumenkohl', '2 Karotten', '1 Dose Kichererbsen', '400ml Kokosmilch', 'Currypaste & Gewürze']
    },
    {
      id: 3,
      titel: 'Schoko-Brownies',
      bild: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400',
      zeit: '40 Min',
      portionen: '12 Stücke',
      beschreibung: 'Saftige Schokoladen-Brownies mit knuspriger Kruste. Ein Traum für alle Schokoladenliebhaber!',
      zutaten: ['200g Zartbitterschokolade', '150g Butter', '3 Eier', '150g Zucker', '100g Mehl']
    },
    {
      id: 4,
      titel: 'Tomatensuppe',
      bild: null,
      zeit: '30 Min',
      portionen: '4 Portionen',
      beschreibung: 'Eine cremige Tomatensuppe, die perfekt an kalten Tagen wärmt. Einfach und köstlich!',
      zutaten: ['1kg reife Tomaten', '2 Zwiebeln', '3 Knoblauchzehen', '500ml Gemüsebrühe', 'Sahne & Basilikum']
    }
  ];

  ausgewaehltes_rezept: Rezept | null = null;
  modal_aktiv = false;

  get gefilterte_rezepte(): Rezept[] {
    if (!this.suchbegriff.trim()) {
      return this.rezepte;
    }
    
    const suche = this.suchbegriff.toLowerCase();
    return this.rezepte.filter(rezept => 
      rezept.titel.toLowerCase().includes(suche)
    );
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

    const neues_rezept: Rezept = {
      id: this.rezepte.length > 0 ? Math.max(...this.rezepte.map(r => r.id)) + 1 : 1,
      titel: this.neues_rezept.titel.trim(),
      bild: this.neues_rezept.bild || null,
      zeit: this.neues_rezept.zeit.trim() || 'unbekannt',
      portionen: this.neues_rezept.portionen.trim() || 'unbekannt',
      beschreibung: this.neues_rezept.beschreibung.trim(),
      zutaten: this.neues_rezept.zutaten.filter(z => z.trim())
    };

    this.rezepte.unshift(neues_rezept);
    this.schliesseFormular();
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
      zutaten: ['']
    };
  }
}