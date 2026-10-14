using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Payment
{
    public string PkPaymentId { get; set; } = null!;

    public string FkOrderId { get; set; } = null!;

    public decimal Amount { get; set; }

    public string? ProviderReference { get; set; }

    public DateTime? PaidAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Order FkOrder { get; set; } = null!;
}
