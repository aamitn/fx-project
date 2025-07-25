using System.ComponentModel.DataAnnotations;

public class RegisterDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class EmailDto
{
    public string Email { get; set; } = string.Empty;
}

public class ConfirmEmailDto
{
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class TwoFADto
{
    public string Email { get; set; }
    public string Code { get; set; }
}

public class LoginVerifyDto
{
    public string UserId { get; set; }
    public string Code { get; set; }
}


public class TwoFACodeDto
{
    [Required]
    public string Code { get; set; }
}
