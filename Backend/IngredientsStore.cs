using Oracle.ManagedDataAccess.Client;

internal class IngredientStore
{
    public static List<Ingredient> GetIngredientsForRecipe(int recipeId)
    {
        var ingredients = new List<Ingredient>();

        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        cmd.CommandText = "SELECT * FROM ingredients WHERE recipe_id = :recipeId";
        cmd.Parameters.Add(":recipeId", OracleDbType.Int32).Value = recipeId;

        var reader = cmd.ExecuteReader();

        while (reader.Read()) {
            ingredients.Add(new Ingredient
            {
                IngredientId = reader.GetInt32(reader.GetOrdinal("ingredient_id")),
                RecipeId = reader.GetInt32(reader.GetOrdinal("recipe_id")),
                ItemId = reader.GetInt32(reader.GetOrdinal("item_id")),
                Amount = reader.GetInt32(reader.GetOrdinal("amount")),
                Unit = reader.GetString(reader.GetOrdinal("unit"))
            });
        }

        return ingredients;
    }
}