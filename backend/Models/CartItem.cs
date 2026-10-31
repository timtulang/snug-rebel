using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models;

public partial class CartItem
{
    public string PkCartItemId { get; set; } = null!;

    public string FkCartId { get; set; } = null!;

    public string FkProductVariantId { get; set; } = null!;

    public int Quantity { get; set; }

    public DateTime? AddedAt { get; set; }

    [JsonIgnore]
    public virtual Cart FkCart { get; set; } = null!;

    [JsonIgnore]
    public virtual ProductVariant FkProductVariant { get; set; } = null!;
}
