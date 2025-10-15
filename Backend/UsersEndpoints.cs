using System.Security.Cryptography.X509Certificates;

public static class UsersEndpoints
{
    public static void MapUsersEndpoints(this WebApplication app)
    {
        app.MapPost("/api/users/register", RegisterUser);
    }

    private static IResult RegisterUser(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName) ||
            string.IsNullOrWhiteSpace(dto.LastName) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return Results.BadRequest("Felder fehlen.");
        }

        var pwHash = dto.Password;

        try
        {
            int newId = UserRepository.Create(dto.FirstName, dto.LastName, dto.Email, pwHash);
            return Results.Created($"/api/user/{newId}", new { userId = newId });
        }
        catch (Exception ex)
        {
            return Results.Problem("Fehler beim Speichern.");
        }
    }
}