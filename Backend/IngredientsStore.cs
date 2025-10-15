using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;

internal class IngredientStore
{
    public static List<Ingredient> GetIngredientsForRecipe(int recipeId)
    {
        var ingredients = new List<Ingredient>();

        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        cmd.CommandText = "SELECT * FROM RECIPE_ITEMS WHERE recipe_id = :recipeId";  // ← RECIPE_ITEMS statt INGREDIENTS
        cmd.Parameters.Add(":recipeId", OracleDbType.Int32).Value = recipeId;

        var reader = cmd.ExecuteReader();

        while (reader.Read())
        {
            ingredients.Add(new Ingredient
            {
                IngredientId = reader.GetInt32(reader.GetOrdinal("recipe_item_id")),  // ← recipe_item_id statt ingredient_id
                RecipeId = reader.GetInt32(reader.GetOrdinal("recipe_id")),
                ItemId = reader.GetInt32(reader.GetOrdinal("item_id")),
                Amount = reader.GetInt32(reader.GetOrdinal("amount")),
                Unit = reader.GetString(reader.GetOrdinal("unit"))
            });
        }

        return ingredients;
    }

    public static Ingredient CreateIngredient(Ingredient ingredient)
    {
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        cmd.CommandText = @"
            INSERT INTO RECIPE_ITEMS (recipe_id, item_id, amount, unit)
            VALUES (:recipeId, :itemId, :amount, :unit)
            RETURNING recipe_item_id INTO :ingredientId";  // ← recipe_item_id

        cmd.Parameters.Add(":recipeId", OracleDbType.Int32).Value = ingredient.RecipeId;
        cmd.Parameters.Add(":itemId", OracleDbType.Int32).Value = ingredient.ItemId;
        cmd.Parameters.Add(":amount", OracleDbType.Int32).Value = ingredient.Amount;
        cmd.Parameters.Add(":unit", OracleDbType.Varchar2).Value = ingredient.Unit;

        var ingredientIdParam = new OracleParameter(":ingredientId", OracleDbType.Int32);
        ingredientIdParam.Direction = System.Data.ParameterDirection.Output;
        cmd.Parameters.Add(ingredientIdParam);

        cmd.ExecuteNonQuery();
        
        ingredient.IngredientId = ((OracleDecimal)ingredientIdParam.Value).ToInt32();

        return ingredient;
    }

    public static void DeleteIngredientsForRecipe(int recipeId)
    {
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        cmd.CommandText = "DELETE FROM RECIPE_ITEMS WHERE recipe_id = :recipeId";  // ← RECIPE_ITEMS
        cmd.Parameters.Add(":recipeId", OracleDbType.Int32).Value = recipeId;

        cmd.ExecuteNonQuery();
    }
}