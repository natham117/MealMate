public class Ingredient
{
    public int IngredientId { get; set; }
    public int RecipeId { get; set; }
    public int ItemId { get; set; }
    public int Amount { get; set; }
    public string Unit { get; set; }
}

/**
 * Represents an ingredient used in a recipe, including its quantity and measurement unit.
 */