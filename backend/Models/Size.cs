using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Size
{
    public long PkSizeId { get; set; }

    public string Label { get; set; } = null!;

    public int SortOrder { get; set; }

    public virtual ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();
}
