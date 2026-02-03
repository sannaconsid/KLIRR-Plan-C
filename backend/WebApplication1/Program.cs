using WebApplication1;
using Microsoft.EntityFrameworkCore;
using Business.Data;
using Business.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddTransient<IssueService>();
builder.Services.AddTransient<InfoService>();

// Configure Entity Framework with SQLite
builder.Services.AddDbContext<EmberDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=ember.db";
    //var connectionString = "Data Source=ember.db";
    options.UseSqlite(connectionString);
});

// Swagger/Swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo { Title = "My API", Version = "v1" });
});
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000") // React dev server
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EmberDbContext>();
    db.Database.EnsureCreated();
}


app.UseHttpsRedirection();
app.UseCors("CorsPolicy");
app.UseAuthorization();
app.MapControllers();
app.MapHub<ChatHub>("/chatHub");

app.Run();
