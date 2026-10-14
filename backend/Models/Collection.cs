using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Collection
{
    public string PkCollectionId { get; set; } = null!;

    public string CollectionName { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Description { get; set; }

    public string? BannerUrl { get; set; }

    public bool IsActive { get; set; }

    public DateOnly? LaunchDate { get; set; }
}
