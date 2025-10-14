import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListDetails } from './shopping-list-details';

describe('ShoppingListDetails', () => {
  let component: ShoppingListDetails;
  let fixture: ComponentFixture<ShoppingListDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingListDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoppingListDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
