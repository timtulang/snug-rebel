using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models;

public partial class CollectionProduct
{
    public string FkCollectionId { get; set; } = null!;

    public string FkProductId { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    [JsonIgnore]
    public virtual Collection FkCollection { get; set; } = null!;

    [JsonIgnore]
    public virtual Product FkProduct { get; set; } = null!;
}
