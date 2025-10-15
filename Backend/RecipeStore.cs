using Oracle.ManagedDataAccess.Client;

internal class RecipeStore
{
    public static Recipe TraceRecipe(string recipeName)
    {
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        cmd.CommandText = "SELECT * FROM recipes WHERE recipe_name = :recipeName";
        cmd.Parameters.Add(":recipeName", OracleDbType.Varchar2, 100).Value = recipeName;

        var reader = cmd.ExecuteReader();

        if (reader.Read()) {
            return new Recipe
            {
                RecipeId = reader.GetInt32(reader.GetOrdinal("recipe_id")),
                UserId = reader.GetInt32(reader.GetOrdinal("user_id")),
                RecipeName = reader.GetString(reader.GetOrdinal("recipe_name")),
                Description = reader.GetString(reader.GetOrdinal("description")),

                Ingredients = IngredientStore.GetIngredientsForRecipe(reader.GetInt32(reader.GetOrdinal("recipe_id")))
            };
        } else {
            Console.WriteLine("Es konnte kein Rezept gefunden werden.");
        }
        return null;
    }
}