using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class RecipesController : ControllerBase
{

    [HttpGet]
    public ActionResult<List<RecipeDto>> GetAllRecipes([FromQuery] int? userId)
    {
        try
        {
            var recipes = RecipeStore.GetAllRecipes(userId);
            var recipeDtos = recipes.Select(r => MapToDto(r)).ToList();
            return Ok(recipeDtos);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"FEHLER: {ex.Message}");
            Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            return StatusCode(500, $"Fehler beim Laden der Rezepte: {ex.Message}");
        }
    }
/*
    [HttpGet]
    public ActionResult<List<RecipeDto>> GetAllRecipes([FromQuery] int? userId)
    {
        try
        {
            var recipes = RecipeStore.GetAllRecipes(userId);
            var recipeDtos = recipes.Select(r => MapToDto(r)).ToList();
            return Ok(recipeDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Fehler beim Laden der Rezepte: {ex.Message}");
        }
    }*/

    [HttpGet("{id}")]
    public ActionResult<RecipeDto> GetRecipe(int id)
    {
        try
        {
            var recipe = RecipeStore.GetRecipeById(id);
            if (recipe == null)
                return NotFound($"Rezept mit ID {id} nicht gefunden");
            
            return Ok(MapToDto(recipe));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Fehler beim Laden des Rezepts: {ex.Message}");
        }
    }

    [HttpPost]
    public ActionResult<RecipeDto> CreateRecipe([FromBody] RecipeDto recipeDto)
    {
        try
        {
            var recipe = MapToEntity(recipeDto);
            var createdRecipe = RecipeStore.CreateRecipe(recipe);
            return CreatedAtAction(nameof(GetRecipe), new { id = createdRecipe.RecipeId }, MapToDto(createdRecipe));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Fehler beim Erstellen des Rezepts: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public ActionResult<RecipeDto> UpdateRecipe(int id, [FromBody] RecipeDto recipeDto)
    {
        try
        {
            var recipe = MapToEntity(recipeDto);
            recipe.RecipeId = id;
            var updatedRecipe = RecipeStore.UpdateRecipe(recipe);
            if (updatedRecipe == null)
                return NotFound($"Rezept mit ID {id} nicht gefunden");
            
            return Ok(MapToDto(updatedRecipe));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Fehler beim Aktualisieren des Rezepts: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public ActionResult DeleteRecipe(int id)
    {
        try
        {
            var success = RecipeStore.DeleteRecipe(id);
            if (!success)
                return NotFound($"Rezept mit ID {id} nicht gefunden");
            
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Fehler beim Löschen des Rezepts: {ex.Message}");
        }
    }

    private RecipeDto MapToDto(Recipe recipe)
    {
        var ingredientStrings = recipe.Ingredients?.Select(ing => 
        {
            var item = ItemStore.GetItemById(ing.ItemId);
            return $"{ing.Amount}{ing.Unit} {item?.ItemName ?? "unbekannt"}";
        }).ToList() ?? new List<string>();

        return new RecipeDto
        {
            Id = recipe.RecipeId,
            Titel = recipe.RecipeName,
            Bild = recipe.ImageUrl,
            Zeit = $"{recipe.PreparationTime} Min",
            Portionen = $"{recipe.Portions} Portionen",
            Beschreibung = recipe.Description,
            Anleitung = recipe.Instructions,
            Vegetarisch = recipe.Vegetarian,
            Vegan = recipe.Vegan,
            Zutaten = ingredientStrings
        };
    }

    private Recipe MapToEntity(RecipeDto dto)
    {
        // Parse Zeit und Portionen
        int preparationTime = 0;
        int portions = 0;
        
        if (!string.IsNullOrEmpty(dto.Zeit))
        {
            var timeMatch = System.Text.RegularExpressions.Regex.Match(dto.Zeit, @"\d+");
            if (timeMatch.Success)
                int.TryParse(timeMatch.Value, out preparationTime);
        }

        if (!string.IsNullOrEmpty(dto.Portionen))
        {
            var portionMatch = System.Text.RegularExpressions.Regex.Match(dto.Portionen, @"\d+");
            if (portionMatch.Success)
                int.TryParse(portionMatch.Value, out portions);
        }

        var recipe = new Recipe
        {
            RecipeId = dto.Id,
            UserId = 1, // TODO: Aus Authentication Context holen
            RecipeName = dto.Titel,
            Description = dto.Beschreibung,
            Instructions = dto.Anleitung ?? "",
            Visibility = true,
            Vegetarian = dto.Vegetarisch,
            Vegan = dto.Vegan,
            ImageUrl = dto.Bild,
            PreparationTime = preparationTime,
            Portions = portions,
            Ingredients = new List<Ingredient>()
        };

        // Zutaten parsen
        if (dto.Zutaten != null)
        {
            foreach (var zutatStr in dto.Zutaten)
            {
                if (!string.IsNullOrWhiteSpace(zutatStr))
                {
                    var ingredient = ParseIngredient(zutatStr);
                    if (ingredient != null)
                    {
                        recipe.Ingredients.Add(ingredient);
                    }
                }
            }
        }

        return recipe;
    }

    private Ingredient ParseIngredient(string zutatStr)
    {
        // Einfaches Parsing: "200g Mehl" -> Amount=200, Unit=g, Item=Mehl
        var match = System.Text.RegularExpressions.Regex.Match(zutatStr, @"^(\d+)\s*([a-zA-Z]*)\s*(.+)$");
        
        if (match.Success)
        {
            int amount = int.Parse(match.Groups[1].Value);
            string unit = match.Groups[2].Value;
            string itemName = match.Groups[3].Value.Trim();

            var item = ItemStore.GetOrCreateItem(itemName);

            return new Ingredient
            {
                ItemId = item.ItemId,
                Amount = amount,
                Unit = unit
            };
        }
        else
        {
            // Kein Match - erstelle Item ohne Menge
            var item = ItemStore.GetOrCreateItem(zutatStr.Trim());
            return new Ingredient
            {
                ItemId = item.ItemId,
                Amount = 0,
                Unit = ""
            };
        }
    }
}