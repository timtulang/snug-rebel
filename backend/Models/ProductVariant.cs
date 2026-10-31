using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models;

public partial class ProductVariant
{
    public string PkProductVariantId { get; set; } = null!;

    public string FkProductId { get; set; } = null!;

    public long FkSizeId { get; set; }

    public long FkColorId { get; set; }

    public string Sku { get; set; } = null!;

    public decimal? PriceOverride { get; set; }

    public int StockQuantity { get; set; }

    public int ReorderLevel { get; set; }

    public bool IsActive { get; set; }

    [JsonIgnore]
    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    [JsonIgnore]
    public virtual Color FkColor { get; set; } = null!;

    [JsonIgnore]
    public virtual Product FkProduct { get; set; } = null!;

    [JsonIgnore]
    public virtual Size FkSize { get; set; } = null!;

    [JsonIgnore]
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    [JsonIgnore]
    public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
}
