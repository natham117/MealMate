using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;

internal class RecipeStore
{
    public static List<Recipe> GetAllRecipes(int? userId)
    {
        var recipes = new List<Recipe>();
        
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        
        if (userId.HasValue)
        {
            cmd.CommandText = "SELECT * FROM recipes WHERE user_id = :userId ORDER BY recipe_id DESC";
            cmd.Parameters.Add(":userId", OracleDbType.Int32).Value = userId.Value;
        }
        else
        {
            cmd.CommandText = "SELECT * FROM recipes WHERE visibility = 1 ORDER BY recipe_id DESC";
        }

        var reader = cmd.ExecuteReader();

        while (reader.Read())
        {
            recipes.Add(ReadRecipe(reader));
        }

        return recipes;
    }

    public static Recipe GetRecipeById(int recipeId)
    {
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        cmd.CommandText = "SELECT * FROM recipes WHERE recipe_id = :recipeId";
        cmd.Parameters.Add(":recipeId", OracleDbType.Int32).Value = recipeId;

        var reader = cmd.ExecuteReader();

        if (reader.Read())
        {
            return ReadRecipe(reader);
        }
        
        return null;
    }

    public static Recipe TraceRecipe(string recipeName)
    {
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        cmd.CommandText = "SELECT * FROM recipes WHERE recipe_name = :recipeName";
        cmd.Parameters.Add(":recipeName", OracleDbType.Varchar2, 100).Value = recipeName;

        var reader = cmd.ExecuteReader();

        if (reader.Read())
        {
            return ReadRecipe(reader);
        }
        
        Console.WriteLine("Es konnte kein Rezept gefunden werden.");
        return null;
    }

    public static Recipe CreateRecipe(Recipe recipe)
    {
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        cmd.CommandText = @"
            INSERT INTO recipes (user_id, recipe_name, description, instructions, visibility, 
                               vegetarian, vegan, image_url, preparation_time, portions)
            VALUES (:userId, :recipeName, :description, :instructions, :visibility,
                   :vegetarian, :vegan, :imageUrl, :preparationTime, :portions)
            RETURNING recipe_id INTO :recipeId";

        cmd.Parameters.Add(":userId", OracleDbType.Int32).Value = recipe.UserId;
        cmd.Parameters.Add(":recipeName", OracleDbType.Varchar2).Value = recipe.RecipeName;
        cmd.Parameters.Add(":description", OracleDbType.Varchar2).Value = recipe.Description ?? "";
        cmd.Parameters.Add(":instructions", OracleDbType.Varchar2).Value = recipe.Instructions ?? "";
        cmd.Parameters.Add(":visibility", OracleDbType.Int32).Value = recipe.Visibility ? 1 : 0;
        cmd.Parameters.Add(":vegetarian", OracleDbType.Int32).Value = recipe.Vegetarian ? 1 : 0;
        cmd.Parameters.Add(":vegan", OracleDbType.Int32).Value = recipe.Vegan ? 1 : 0;
        cmd.Parameters.Add(":imageUrl", OracleDbType.Varchar2).Value = recipe.ImageUrl ?? (object)DBNull.Value;
        cmd.Parameters.Add(":preparationTime", OracleDbType.Int32).Value = recipe.PreparationTime;
        cmd.Parameters.Add(":portions", OracleDbType.Int32).Value = recipe.Portions;
        
        var recipeIdParam = new OracleParameter(":recipeId", OracleDbType.Int32);
        recipeIdParam.Direction = System.Data.ParameterDirection.Output;
        cmd.Parameters.Add(recipeIdParam);

        cmd.ExecuteNonQuery();
        
        recipe.RecipeId = ((OracleDecimal)recipeIdParam.Value).ToInt32();

        // Zutaten hinzufügen
        foreach (var ingredient in recipe.Ingredients)
        {
            ingredient.RecipeId = recipe.RecipeId;
            IngredientStore.CreateIngredient(ingredient);
        }

        return GetRecipeById(recipe.RecipeId);
    }

    public static Recipe UpdateRecipe(Recipe recipe)
    {
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        cmd.CommandText = @"
            UPDATE recipes 
            SET recipe_name = :recipeName, 
                description = :description,
                instructions = :instructions,
                visibility = :visibility,
                vegetarian = :vegetarian,
                vegan = :vegan,
                image_url = :imageUrl,
                preparation_time = :preparationTime,
                portions = :portions
            WHERE recipe_id = :recipeId";

        cmd.Parameters.Add(":recipeName", OracleDbType.Varchar2).Value = recipe.RecipeName;
        cmd.Parameters.Add(":description", OracleDbType.Varchar2).Value = recipe.Description ?? "";
        cmd.Parameters.Add(":instructions", OracleDbType.Varchar2).Value = recipe.Instructions ?? "";
        cmd.Parameters.Add(":visibility", OracleDbType.Int32).Value = recipe.Visibility ? 1 : 0;
        cmd.Parameters.Add(":vegetarian", OracleDbType.Int32).Value = recipe.Vegetarian ? 1 : 0;
        cmd.Parameters.Add(":vegan", OracleDbType.Int32).Value = recipe.Vegan ? 1 : 0;
        cmd.Parameters.Add(":imageUrl", OracleDbType.Varchar2).Value = recipe.ImageUrl ?? (object)DBNull.Value;
        cmd.Parameters.Add(":preparationTime", OracleDbType.Int32).Value = recipe.PreparationTime;
        cmd.Parameters.Add(":portions", OracleDbType.Int32).Value = recipe.Portions;
        cmd.Parameters.Add(":recipeId", OracleDbType.Int32).Value = recipe.RecipeId;

        int rowsAffected = cmd.ExecuteNonQuery();

        if (rowsAffected > 0)
        {
            // Alte Zutaten löschen und neue hinzufügen
            IngredientStore.DeleteIngredientsForRecipe(recipe.RecipeId);
            foreach (var ingredient in recipe.Ingredients)
            {
                ingredient.RecipeId = recipe.RecipeId;
                IngredientStore.CreateIngredient(ingredient);
            }

            return GetRecipeById(recipe.RecipeId);
        }

        return null;
    }

    public static bool DeleteRecipe(int recipeId)
    {
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        // Zuerst Zutaten löschen
        IngredientStore.DeleteIngredientsForRecipe(recipeId);

        cmd.BindByName = true;
        cmd.CommandText = "DELETE FROM recipes WHERE recipe_id = :recipeId";
        cmd.Parameters.Add(":recipeId", OracleDbType.Int32).Value = recipeId;

        int rowsAffected = cmd.ExecuteNonQuery();
        return rowsAffected > 0;
    }

    private static Recipe ReadRecipe(OracleDataReader reader)
    {
        var recipe = new Recipe
        {
            RecipeId = reader.GetInt32(reader.GetOrdinal("recipe_id")),
            UserId = reader.GetInt32(reader.GetOrdinal("user_id")),
            RecipeName = reader.GetString(reader.GetOrdinal("recipe_name")),
            Description = !reader.IsDBNull(reader.GetOrdinal("description")) 
                ? reader.GetString(reader.GetOrdinal("description")) : "",
            Instructions = !reader.IsDBNull(reader.GetOrdinal("instructions")) 
                ? reader.GetString(reader.GetOrdinal("instructions")) : "",
            Visibility = reader.GetInt32(reader.GetOrdinal("visibility")) == 1,
            Vegetarian = reader.GetInt32(reader.GetOrdinal("vegetarian")) == 1,
            Vegan = reader.GetInt32(reader.GetOrdinal("vegan")) == 1,
            ImageUrl = !reader.IsDBNull(reader.GetOrdinal("image_url")) 
                ? reader.GetString(reader.GetOrdinal("image_url")) : null,
            PreparationTime = reader.GetInt32(reader.GetOrdinal("preparation_time")),
            Portions = reader.GetInt32(reader.GetOrdinal("portions")),
            Ingredients = IngredientStore.GetIngredientsForRecipe(reader.GetInt32(reader.GetOrdinal("recipe_id")))
        };

        return recipe;
    }
}