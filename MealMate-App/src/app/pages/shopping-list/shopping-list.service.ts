import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

const BASE_URL = "http://localhost:5000";

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
    constructor(private http: HttpClient) {}

    toggleItem(listId: number, groceryListItemId: number, isChecked: boolean): Observable<any> {
        return this.http.patch(`${BASE_URL}/api/shoppinglist/${listId}/items/${groceryListItemId}`, {isChecked});
    }
}