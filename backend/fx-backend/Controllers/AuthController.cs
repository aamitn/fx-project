using fx_backend.Models;
using fx_backend.Models.DTOs;
using fx_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Web;

namespace fx_backend.Controllers
{
    [ApiController]
    // [EnableRateLimiting("fixed")]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _config;
        private readonly ILogger<AuthController> _logger;
        private readonly EmailService _emailService;
        private string GenerateConfirmationEmailBody(string confirmUrl, string token)
        {
            return $@"
        <h2>FurnXpert Email Confirmation</h2>
        <p>Click the link below to confirm your email:</p>
        <a href='{confirmUrl}'
           style='
               display: inline-block;
               padding: 10px 20px;
               font-family: Arial, sans-serif;
               font-size: 16px;
               color: #ffffff;
               background-color: #007bff;
               border-radius: 5px;
               text-decoration: none;
               text-align: center;
               border: 1px solid #007bff;
               cursor: pointer;
               -webkit-text-size-adjust: none;
               mso-hide: all;
           '
        >
            Confirm Email
        </a>
        <hr/>
        <p>If the button above does not work, copy and paste this link into your browser:</p>
        <p>{confirmUrl}</p>
        <p>For troubleshooting, your raw confirmation token is:</p>
        <p>{token}</p>
    ";
        }

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration config,
            ILogger<AuthController> logger,
            EmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
            _logger = logger;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                _logger.LogWarning("Registration failed: {@Errors}", result.Errors);

                var errorMessages = result.Errors.Select(e => e.Description);
                return BadRequest(new { errors = errorMessages });
            }

            // --- ROLE Assign the "User" role ---
            // Ensure "User" role exists in your database (seed it in AppDbContext if not)
            var roleResult = await _userManager.AddToRoleAsync(user, "User");
            if (!roleResult.Succeeded)
            {
                _logger.LogError("Failed to assign 'User' role to new user {Email}: {@Errors}", user.Email, roleResult.Errors);
                // Optionally, you might want to delete the user here if role assignment is critical
                // await _userManager.DeleteAsync(user);
                var roleErrorMessages = roleResult.Errors.Select(e => e.Description);
                return StatusCode(500, new { errors = roleErrorMessages, message = "User registered but failed to assign role." });
            }
            // --- END NEW ---

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebUtility.UrlEncode(token);
            var confirmUrl = $"{_config["AppSettings:FrontendBaseUrl"]}/confirm-email?email={user.Email}&token={encodedToken}";
            var emailBody = GenerateConfirmationEmailBody(confirmUrl, token); // Assuming this method exists

            await _emailService.SendEmailAsync(user.Email, "Confirm your FurnXpert account", emailBody);

            return Ok(new { message = "Registration successful. Please check your email to confirm your account." });
        }

        [HttpPost("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest("Invalid user");

            // Start with the original token.
            var tokenToConfirm = dto.Token;

            // ✅ Check if the token contains '%' before attempting to decode.
            // This handles cases where the browser has already decoded the token.
            if (tokenToConfirm.Contains("%"))
            {
                tokenToConfirm = WebUtility.UrlDecode(dto.Token);
            }

            var result = await _userManager.ConfirmEmailAsync(user, tokenToConfirm);

            return result.Succeeded ? Ok("Email confirmed") : BadRequest(result.Errors);
        }

        [HttpPost("resend-confirmation")]
        public async Task<IActionResult> ResendEmail([FromBody] EmailDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest("User not found.");

            if (user.EmailConfirmed)
                return BadRequest("Email is already confirmed.");

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebUtility.UrlEncode(token);
            var confirmUrl = $"{_config["AppSettings:FrontendBaseUrl"]}/confirm-email?email={user.Email}&token={encodedToken}";

            var emailBody = GenerateConfirmationEmailBody(confirmUrl, token);

            await _emailService.SendEmailAsync(user.Email, "Confirm your FurnXpert account", emailBody);

            return Ok("Confirmation email resent.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
                return Unauthorized("Invalid credentials");

            // Check if 2FA is enabled for the user
            if (await _userManager.GetTwoFactorEnabledAsync(user))
            {
                // If 2FA is enabled, return a specific response to the client.
                // The client will then know to prompt the user for a 2FA code.
                return Ok(new
                {
                    status = "2FA_REQUIRED",
                    userId = user.Id
                });
            }

            // If 2FA is not enabled, proceed with the standard JWT generation
            var token = await GenerateJwtToken(user);
            return Ok(new { token });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] EmailDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                return Ok();
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebUtility.UrlEncode(token);
            var resetUrl = $"{_config["AppSettings:FrontendBaseUrl"]}/reset-password?email={user.Email}&token={encodedToken}";

            var emailBody = $@"
                <h2>FurnXpert Password Reset</h2>
                <p>You have requested a password reset. Please click the link below to set a new password:</p>
                <a href='{resetUrl}'>Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
            ";

            await _emailService.SendEmailAsync(user.Email, "FurnXpert Password Reset", emailBody);

            return Ok("Password reset link sent to your email.");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) return BadRequest("Invalid user");

            // Start with the original token.
            var tokenToConfirm = dto.Token;

            // ✅ Check if the token contains '%' before attempting to decode.
            // This handles cases where the browser has already decoded the token.
            if (tokenToConfirm.Contains("%"))
            {
                tokenToConfirm = WebUtility.UrlDecode(dto.Token);
            }

            var result = await _userManager.ResetPasswordAsync(user, tokenToConfirm, dto.NewPassword);
            return result.Succeeded ? Ok("Password reset") : BadRequest(result.Errors);
        }



        // ✅ New implementation for Login via OTP
        [HttpPost("login-email-otp")]
        public async Task<IActionResult> LoginWithOtp([FromBody] EmailDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            string successMessage = "If an account exists with that email, a login code has been sent.";

            // This is good practice to prevent user enumeration
            if (user == null)
            {
                _logger.LogWarning("OTP login requested for non-existent user: {Email}", dto.Email);
                return Ok(new { message = successMessage });
            }

            // You could add a check here to ensure the user is allowed to login via OTP.
            // For example, if they have the "Email" token provider enabled.

            // Generate a time-sensitive OTP using the "Email" token provider
            var otp = await _userManager.GenerateTwoFactorTokenAsync(user, "Email");
            _logger.LogInformation("Generated OTP for {Email}: {Otp}", dto.Email, otp);

            // Send the OTP to the user's email
            var emailBody = $@"
                <h2>FurnXpert OTP Login</h2>
                <p>Your one-time login code is:</p>
                <h3>{otp}</h3>
                <p>This code will expire in 5 minutes.</p>
            ";

            await _emailService.SendEmailAsync(user.Email, "Your FurnXpert Login Code", emailBody);

            // ✅ MODIFICATION: Return the user's ID so the client can use it for verification
            return Ok(new
            {
                message = successMessage,
                userId = user.Id // <-- The key change here
            });
        }



        // ✅ New implementation for verifying the OTP and completing login
        [HttpPost("2fa-verify")]
        public async Task<IActionResult> Verify2FA([FromBody] LoginVerifyDto dto)
        {
            var user = await _userManager.FindByIdAsync(dto.UserId);
            if (user == null)
            {
                return Unauthorized("Invalid login attempt.");
            }

            // Try to verify the code from the authenticator app
            var isAuthenticatorValid = await _userManager.VerifyTwoFactorTokenAsync(user, _userManager.Options.Tokens.AuthenticatorTokenProvider, dto.Code);
            if (isAuthenticatorValid)
            {
                _logger.LogInformation("Authenticator code verified for user: {Email}", user.Email);
                var token = await GenerateJwtToken(user);
                return Ok(new { token });
            }

            // If the authenticator code is not valid, try the email OTP
            var isEmailOtpValid = await _userManager.VerifyTwoFactorTokenAsync(user, "Email", dto.Code);
            if (isEmailOtpValid)
            {
                _logger.LogInformation("Email OTP verified for user: {Email}", user.Email);
                var token = await GenerateJwtToken(user);
                return Ok(new { token });
            }

            _logger.LogWarning("Invalid 2FA code provided for user: {Email}", user.Email);
            return Unauthorized("Invalid 2FA code.");
        }


        [HttpPost("webauthn-init")]
        public IActionResult BeginWebAuthn()
        {
            return Ok("WebAuthn registration started");
        }

        [HttpPost("webauthn-login")]
        public IActionResult CompleteWebAuthn()
        {
            return Ok("WebAuthn login successful");
        }

        // ✅ 2FA Management: Get authenticator setup details
        [Authorize]
        [HttpGet("2fa/setup-authenticator")]
        public async Task<IActionResult> SetupAuthenticator()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Resetting the authenticator key ensures a fresh setup
            await _userManager.ResetAuthenticatorKeyAsync(user);
            var unformattedKey = await _userManager.GetAuthenticatorKeyAsync(user);




            var authenticatorUri = $"otpauth://totp/{Uri.EscapeDataString(_config["AppSettings:AppName"])}:{Uri.EscapeDataString(user.Email)}?secret={unformattedKey}&issuer={Uri.EscapeDataString(_config["AppSettings:AppName"])}";



          //  var authenticatorUri = $"otpauth://totp/{HttpUtility.UrlEncode(_config["AppSettings:AppName"])}:{user.Email}?secret={unformattedKey}&issuer={HttpUtility.UrlEncode(_config["AppSettings:AppName"])}";

            return Ok(new
            {
                unformattedKey,
                authenticatorUri // Client can use this to generate a QR code
            });
        }

        // ✅ 2FA Management: Enable 2FA with authenticator code
        [Authorize]
        [HttpPost("2fa/enable-authenticator")]
        public async Task<IActionResult> EnableAuthenticator([FromBody] TwoFACodeDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { status = "User not found." }); // Return an anonymous object
            }

            var is2faTokenValid = await _userManager.VerifyTwoFactorTokenAsync(user, _userManager.Options.Tokens.AuthenticatorTokenProvider, dto.Code);

            if (!is2faTokenValid)
            {
                return BadRequest(new { status = "Invalid 2FA code." }); // Return an anonymous object
            }

            user.TwoFactorEnabled = true;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { status = "2FA enabled successfully." }); // Return an anonymous object
            }
            else
            {
                // For multiple errors, you could return the full IdentityResult errors
                return BadRequest(new { status = "Failed to enable 2FA." });
            }
        }

        // ✅ 2FA Management: Disable 2FA
        [Authorize]
        [HttpPost("2fa/disable")]
        public async Task<IActionResult> Disable2FA([FromBody] LoginDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Re-verify the password to confirm user identity
            var checkPassword = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!checkPassword)
            {
                return Unauthorized("Invalid password.");
            }

            var result = await _userManager.SetTwoFactorEnabledAsync(user, false);
            if (!result.Succeeded)
            {
                return BadRequest("Could not disable 2FA.");
            }

            return Ok("2FA disabled successfully.");
        }

        // ✅ 2FA Management: Send email OTP
        // This can be used as an alternative to the authenticator app
        [Authorize]
        [HttpPost("2fa/send-email-otp")]
        public async Task<IActionResult> SendEmailOtp()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            if (!await _userManager.GetTwoFactorEnabledAsync(user))
            {
                return BadRequest("2FA is not enabled for this account.");
            }

            var otp = await _userManager.GenerateTwoFactorTokenAsync(user, "Email");

            var emailBody = $@"
                <h2>FurnXpert 2FA Code</h2>
                <p>Your one-time login code is:</p>
                <h3>{otp}</h3>
                <p>This code will expire shortly.</p>";

            await _emailService.SendEmailAsync(user.Email, "Your 2FA Login Code", emailBody);

            return Ok("2FA code sent to your email.");
        }


        // ✅ New endpoint to get user profile data
        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            var userProfile = new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName ?? string.Empty,
                Organization = user.Organization ?? string.Empty,
                JobTitle = user.JobTitle ?? string.Empty,
                Country = user.Country ?? string.Empty,
            };

            return Ok(userProfile);
        }

        // ✅ New endpoint to update user profile
        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            var hasChanges = false;

            // Update FullName if provided
            if (!string.IsNullOrEmpty(dto.FullName) && user.FullName != dto.FullName)
            {
                user.FullName = dto.FullName;
                hasChanges = true;
            }

             // Update Organization if provided
            if (dto.Organization != null && user.Organization != dto.Organization)
            {
                user.Organization = dto.Organization;
                hasChanges = true;
            }

            // Update JobTitle if provided
            if (dto.JobTitle != null && user.JobTitle != dto.JobTitle)
            {
                user.JobTitle = dto.JobTitle;
                hasChanges = true;
            }

            // Update Country if provided
            if (dto.Country != null && user.Country != dto.Country)
            {
                user.Country = dto.Country;
                hasChanges = true;
            }


            // Change password if old and new passwords are provided
            if (!string.IsNullOrEmpty(dto.OldPassword) && !string.IsNullOrEmpty(dto.NewPassword))
            {
                var changePasswordResult = await _userManager.ChangePasswordAsync(user, dto.OldPassword, dto.NewPassword);
                if (!changePasswordResult.Succeeded)
                {
                    _logger.LogWarning("Password change failed for user {UserId}: {@Errors}", user.Id, changePasswordResult.Errors);
                    return BadRequest(changePasswordResult.Errors);
                }
                hasChanges = true;
            }

            // Save the changes to the user object
            if (hasChanges)
            {
                var updateResult = await _userManager.UpdateAsync(user);
                if (updateResult.Succeeded)
                {
                    _logger.LogInformation("Profile updated successfully for user {UserId}", user.Id);
                    return Ok(new { message = "Profile updated successfully." });
                }

                _logger.LogWarning("Profile update failed for user {UserId}: {@Errors}", user.Id, updateResult.Errors);
                return BadRequest(updateResult.Errors);
            }

            return Ok(new { message = "No changes were made." });
        }




        [HttpGet("google/login")]
        public IActionResult GoogleLogin()
        {
            // Retrieve the FrontendBaseUrl from appsettings.json
            var frontendBaseUrl = _config["AppSettings:FrontendBaseUrl"];

            if (string.IsNullOrEmpty(frontendBaseUrl))
                frontendBaseUrl = "http://localhost:8080"; // fallback url

            var properties = new AuthenticationProperties
            {
                RedirectUri = $"{frontendBaseUrl}/auth/google/callback" // Use the retrieved URL
            };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("google/response")]
        public async Task<IActionResult> GoogleResponse()
        {
            var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);

            if (result.Succeeded)
            {
                // Process the Google authentication result
                var user = result.Principal;

                // You can access user information like this:
                var email = user.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
                var name = user.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

                // user creation/login logic 
                using (var scope = HttpContext.RequestServices.CreateScope())
                {
                    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

                    var googleId = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                    var appUser = await userManager.FindByLoginAsync("Google", googleId);

                    if (appUser == null)
                    {
                        appUser = new ApplicationUser
                        {
                            Email = email,
                            UserName = email,
                            FullName = name,
                            GoogleId = googleId,
                            EmailConfirmed = true, // Google confirms email
                            RegisteredAt = DateTime.UtcNow
                        };

                        var createUserResult = await userManager.CreateAsync(appUser);
                        if (!createUserResult.Succeeded)
                        {
                            return BadRequest($"User creation failed: {string.Join(", ", createUserResult.Errors.Select(e => e.Description))}");
                        }

                        var addLoginResult = await userManager.AddLoginAsync(appUser, new UserLoginInfo("Google", googleId, "Google"));
                        if (!addLoginResult.Succeeded)
                        {
                            return BadRequest($"Adding Google login failed: {string.Join(", ", addLoginResult.Errors.Select(e => e.Description))}");
                        }

                        // Assign default role to user, similar to the register endpoint
                        var roleResult = await userManager.AddToRoleAsync(appUser, "User"); // or "Admin"
                        if (!roleResult.Succeeded)
                        {
                            _logger.LogError("Failed to assign 'User' role to new google user {Email}: {@Errors}", appUser.Email, roleResult.Errors);
                            var roleErrorMessages = roleResult.Errors.Select(e => e.Description);
                            return StatusCode(500, new { errors = roleErrorMessages, message = "User registered via google but failed to assign role." });
                        }
                    }

                    // Generate JWT token
                    var token = GenerateJwtToken(appUser);

                    return Ok(new { Token = token, Email = email, Name = name });
                }
            }
            else
            {
                return BadRequest("Google authentication failed.");
            }
        }


        // Endpoint to get roles for the authenticated user
        [Authorize]
        [HttpGet("roles")]
        public async Task<IActionResult> GetCurrentUserRoles()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new { roles = roles });
        }


        // ✅ New endpoint to check if an email (username) exists
        [HttpGet("check-email-exists")]
        public async Task<IActionResult> CheckEmailExists([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { message = "Email parameter is required." });
            }

            var user = await _userManager.FindByEmailAsync(email);
            bool exists = user != null;

            return Ok(new { exists = exists });
        }


        private async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            var authClaims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Name, user.FullName ?? user.Email),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Get and add existing roles to JWT
            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }


            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:SecretKey"]!));

            var token = new JwtSecurityToken(
                issuer: _config["JwtSettings:Issuer"],
                audience: _config["JwtSettings:Audience"],
                expires: DateTime.Now.AddHours(8),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


    }
}