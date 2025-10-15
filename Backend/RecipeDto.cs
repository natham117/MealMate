public class RecipeDto
{
    public int Id { get; set; }
    public string Titel { get; set; }
    public string Bild { get; set; }
    public string Zeit { get; set; }
    public string Portionen { get; set; }
    public string Beschreibung { get; set; }
    public string Anleitung { get; set; }
    public bool Vegetarisch { get; set; }
    public bool Vegan { get; set; }
    public List<string> Zutaten { get; set; }
}