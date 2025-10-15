using System.Security.Authentication.ExtendedProtection;

public class Program
{
    static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
            p.WithOrigins("http://localhost:4200", "https://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod()));

        var app = builder.Build();

        app.UseCors();

        app.MapGet("/healthz", () => Results.Ok(new { status = "ok" }));

        app.MapUsersEndpoints();

        app.Run();
    }
}