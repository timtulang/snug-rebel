using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

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

    [JsonIgnore]
    public virtual Product FkProduct { get; set; } = null!;

    [JsonIgnore]
    public virtual ProductVariant? FkVariant { get; set; }
}
