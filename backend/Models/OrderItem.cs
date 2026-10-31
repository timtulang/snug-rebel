using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models;

public partial class OrderItem
{
    public string PkOrderItemId { get; set; } = null!;

    public string FkOrderId { get; set; } = null!;

    public string FkProductVariantId { get; set; } = null!;

    public string ProductName { get; set; } = null!;

    public string Sku { get; set; } = null!;

    public string SizeLabel { get; set; } = null!;

    public string ColorName { get; set; } = null!;

    public decimal UnitPrice { get; set; }

    public int Quantity { get; set; }

    public decimal LineTotal { get; set; }

    [JsonIgnore]
    public virtual Order FkOrder { get; set; } = null!;

    [JsonIgnore]
    public virtual ProductVariant FkProductVariant { get; set; } = null!;

    [JsonIgnore]
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
