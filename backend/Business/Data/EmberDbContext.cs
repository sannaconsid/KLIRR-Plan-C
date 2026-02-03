using Microsoft.EntityFrameworkCore;

namespace Business.Data;

public class EmberDbContext : DbContext
{
    public EmberDbContext(DbContextOptions<EmberDbContext> options)
        : base(options)
    {
    }

    public DbSet<Issue> Issues { get; set; } = null!;
    public DbSet<Info> Infos { get; set; } = null!;
    public DbSet<InfoType> InfoTypes { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure simple relationships if needed
        modelBuilder.Entity<Issue>()
            .HasOne(i => i.State);

        modelBuilder.Entity<Issue>()
            .HasOne(i => i.Info);
    }
}
