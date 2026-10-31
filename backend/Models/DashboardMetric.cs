using System;

namespace backend.Models;

public partial class DashboardMetric
{
    public string PkDashboardMetricId { get; set; } = null!;

    public string MetricKey { get; set; } = null!;

    public string MetricLabel { get; set; } = null!;

    public string? DayOfWeek { get; set; }

    public int? SlotIndex { get; set; }

    public decimal MetricValue { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
