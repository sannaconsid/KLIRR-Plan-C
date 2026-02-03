using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Business.Data;

public class EmberDbContext
{
    public DbSet<Issue> Issues { get; set; } = null!;
    public DbSet<State> States { get; set; } = null!;
    public DbSet<StateType> StateTypes { get; set; } = null!;
    public DbSet<Info> Infos { get; set; } = null!;
    public DbSet<InfoType> InfoTypes { get; set; } = null!;

}
