using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Shipment
{
    public string PkShipmentId { get; set; } = null!;

    public string FkOrderId { get; set; } = null!;

    public string? Courier { get; set; }

    public string? TrackingNumber { get; set; }

    public DateTime? ShippedAt { get; set; }

    public DateTime? DeliveredAt { get; set; }

    public virtual Order FkOrder { get; set; } = null!;
}
