using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CartItem
{
    public string PkCartItemId { get; set; } = null!;

    public string FkCartId { get; set; } = null!;

    public string FkProductVariantId { get; set; } = null!;

    public int Quantity { get; set; }

    public DateTime? AddedAt { get; set; }

    public virtual Cart FkCart { get; set; } = null!;

    public virtual ProductVariant FkProductVariant { get; set; } = null!;
}
