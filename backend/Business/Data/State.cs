using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Business.Data;

public class StateType
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; } = string.Empty;
}

public class State
{
    [Key]
    public int StateId { get; set; }

    [Required]
    public StateType Type { get; set; } = null!;

    [Required]
    public DateTime StateTime { get; set; }
}
