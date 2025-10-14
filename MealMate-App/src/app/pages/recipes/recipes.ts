import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './recipes.html',
  styleUrl: './recipes.css'
})
export class Recipes {
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

  zeigeDetails(rezept: Rezept): void {
    this.ausgewaehltes_rezept = rezept;
    this.modal_aktiv = true;
  }

  schliesseModal(): void {
    this.modal_aktiv = false;
    this.ausgewaehltes_rezept = null;
  }
}