using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class WishlistItem
{
    public string FkUserId { get; set; } = null!;

    public string FkProuductId { get; set; } = null!;

    public DateTime AddedAt { get; set; }

    public DateTime RemovedAt { get; set; }

    public virtual Product FkProuduct { get; set; } = null!;

    public virtual User FkUser { get; set; } = null!;
}
