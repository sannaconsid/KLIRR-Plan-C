using System;
using System.ComponentModel.DataAnnotations;

namespace Business.Data;

public class InfoType
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;
}

public class Info
{
    [Key]
    public int Id { get; set; }

    [Required]
    public InfoType Type { get; set; } = null!;

    [Required]
    public DateTime InfoTime { get; set; }

    [Required]
    public string InfoText { get; set; } = string.Empty;
}
