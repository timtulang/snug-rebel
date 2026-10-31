using System;

namespace backend.Models;

public partial class DashboardNotification
{
    public string PkDashboardNotificationId { get; set; } = null!;

    public string OrderId { get; set; } = null!;

    public string OrderNumber { get; set; } = null!;

    public string Category { get; set; } = null!;

    public string Weight { get; set; } = null!;

    public string Company { get; set; } = null!;

    public DateTime ArrivalTime { get; set; }

    public string Route { get; set; } = null!;

    public decimal Price { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }
}
