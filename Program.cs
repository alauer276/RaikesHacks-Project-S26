using RaikesHacks_Project_S26.Accessors;
using RaikesHacks_Project_S26.Controllers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register the accessor for dependency injection
builder.Services.AddScoped<ITicketAccessor, TicketAccessor>();
builder.Services.AddScoped<IOfferAccessor, OfferAccessor>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") // Explicitly set the React port
              .AllowAnyHeader()
              .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Disable HTTPS redirection to prevent connection issues in dev

app.UseCors();

app.MapControllers();

app.Run();
