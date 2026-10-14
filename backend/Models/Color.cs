using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Color
{
    public long PkColorId { get; set; }

    public string Name { get; set; } = null!;

    public string HexCode { get; set; } = null!;

    public virtual ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();
}
