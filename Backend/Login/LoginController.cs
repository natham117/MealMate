using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
    [HttpPost]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        LogingManager.Login(request.Email, request.PwHash);
        return Ok();
    }
}

public class LoginRequest
{
    public string Email { get; set; }
    public string PwHash { get; set; }
}