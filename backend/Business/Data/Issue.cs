using System;
using System.ComponentModel.DataAnnotations;

namespace Business.Data;

public class Issue
{
    public const string NewIssueState = "New";
    public const string DefaultIssueOngoing = "Ongoing";
    public const string DefaultIssueParked = "Parked";
    public const string DefaultIssueClosed = "Closed";

    [Key]
    public int Id { get; set; }

    [Required]
    public int Number { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    public string State { get; set; } = null!;
    public List<Info> Info { get; set; } = [];

    public string Description { get; set; } = string.Empty;

    public DateTime TimeStart { get; set; }
    public DateTime? TimeClosed { get; set; }

};

