using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Cart
{
    public string PkCartId { get; set; } = null!;

    public string FkUserId { get; set; } = null!;

    public string? SessionToken { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual User FkUser { get; set; } = null!;
}
