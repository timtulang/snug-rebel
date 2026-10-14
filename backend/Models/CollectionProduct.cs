using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CollectionProduct
{
    public string FkCollectionId { get; set; } = null!;

    public string FkProductId { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Collection FkCollection { get; set; } = null!;

    public virtual Product FkProduct { get; set; } = null!;
}
