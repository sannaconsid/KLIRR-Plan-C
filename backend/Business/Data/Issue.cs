using System;
using System.ComponentModel.DataAnnotations;

namespace Business.Data;

public class Issue
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int Number { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    public State? State { get; set; }
    public Info? Info { get; set; }

    public string Description { get; set; } = string.Empty;

    public DateTime? TimeStart { get; set; }
    public DateTime? TimeClosed { get; set; }

}

