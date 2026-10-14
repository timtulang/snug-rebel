var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddProblemDetails();   // consistent error shape (from the standards)
builder.Services.AddOpenApi();          // built-in OpenAPI document
builder.Services.AddHealthChecks();     // /health, used by the smoke test and CD
builder.Services.AddAuthorization();

// Lets the React dev server (Vite) call the API. Override in appsettings per environment.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                     ?? ["http://localhost:5173"];
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

// Later: register your DbContext and services here.
// builder.Services.AddDbContext<AppDbContext>(...);
// builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();                   // served at /openapi/v1.json
else
    app.UseHttpsRedirection();

app.UseCors();
// app.UseAuthentication();             // enable once you configure JWT or cookies
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapControllers();

app.Run();

public partial class Program { }        // required so the test project can boot the API