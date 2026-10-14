using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class ProductImage
{
    public string PkProductImageId { get; set; } = null!;

    public string FkProductId { get; set; } = null!;

    public string? FkVariantId { get; set; }

    public string Url { get; set; } = null!;

    public string? AltText { get; set; }

    public int SortOrder { get; set; }

    public bool IsPrimary { get; set; }

    public virtual Product FkProduct { get; set; } = null!;

    public virtual ProductVariant? FkVariant { get; set; }
}
