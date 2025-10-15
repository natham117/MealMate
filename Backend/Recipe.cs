public class Recipe
{
    public int RecipeId { get; set; }
    public int UserId { get; set; }
    public string RecipeName { get; set; }
    public string Description { get; set; }
    public bool Visibility { get; set; }
    
    public List<Ingredient> Ingredients { get; set; }
}