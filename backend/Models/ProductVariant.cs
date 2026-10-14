using System;
using System.Collections.Generic;

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

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual Color FkColor { get; set; } = null!;

    public virtual Product FkProduct { get; set; } = null!;

    public virtual Size FkSize { get; set; } = null!;

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
}
