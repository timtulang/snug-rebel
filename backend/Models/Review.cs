using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

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

    [JsonIgnore]
    public virtual OrderItem FkOrderItem { get; set; } = null!;

    [JsonIgnore]
    public virtual Product FkProduct { get; set; } = null!;

    [JsonIgnore]
    public virtual User FkUser { get; set; } = null!;
}
