public class Recipe
{
    public int RecipeId { get; set; }
    public int UserId { get; set; }
    public string RecipeName { get; set; }
    public string Description { get; set; }
    public string Instructions { get; set; }
    public bool Visibility { get; set; }
    public bool Vegetarian { get; set; }
    public bool Vegan { get; set; }
    public string ImageUrl { get; set; }
    public int PreparationTime { get; set; } // in minutes
    public int Portions { get; set; }

    public List<Ingredient> Ingredients { get; set; }
}

/**
 * Represents a cooking recipe with its details and associated ingredients.
 */