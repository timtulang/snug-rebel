using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class OrderStatusHistory
{
    public string PkOrderStatusHistoryId { get; set; } = null!;

    public string FkOrderId { get; set; } = null!;

    public string ChangedBy { get; set; } = null!;

    public string? Note { get; set; }

    public DateTime ChangedAt { get; set; }

    public virtual User ChangedByNavigation { get; set; } = null!;

    public virtual Order FkOrder { get; set; } = null!;
}
