using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models;

public partial class WishlistItem
{
    public string FkUserId { get; set; } = null!;

    public string FkProuductId { get; set; } = null!;

    public DateTime AddedAt { get; set; }

    public DateTime RemovedAt { get; set; }

    [JsonIgnore]
    public virtual Product FkProuduct { get; set; } = null!;

    [JsonIgnore]
    public virtual User FkUser { get; set; } = null!;
}
