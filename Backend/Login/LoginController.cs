using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
    [HttpPost]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        bool result = LogingManager.Login(request.Email, request.PwHash);
        Console.WriteLine($"Login-Email: {request.Email}, Login-Ergebnis: {result}");
        return Ok(new { success = result });
    }
}

public class LoginRequest
{
    public string Email { get; set; }
    public string PwHash { get; set; }
}