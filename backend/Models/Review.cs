using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Review
{
    public string PkReviewId { get; set; } = null!;

    public string FkProductId { get; set; } = null!;

    public string FkUserId { get; set; } = null!;

    public string FkOrderItemId { get; set; } = null!;

    public int Rating { get; set; }

    public string? Body { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual OrderItem FkOrderItem { get; set; } = null!;

    public virtual Product FkProduct { get; set; } = null!;

    public virtual User FkUser { get; set; } = null!;
}
