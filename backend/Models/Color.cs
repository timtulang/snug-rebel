using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models;

public partial class Color
{
    public long PkColorId { get; set; }

    public string Name { get; set; } = null!;

    public string HexCode { get; set; } = null!;

    [JsonIgnore]
    public virtual ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();
}
