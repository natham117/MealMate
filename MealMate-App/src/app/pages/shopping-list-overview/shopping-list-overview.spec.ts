import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListOverview } from './shopping-list-overview';

describe('ShoppingListOverview', () => {
  let component: ShoppingListOverview;
  let fixture: ComponentFixture<ShoppingListOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingListOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoppingListOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
