using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Product
{
    public string PkProductId { get; set; } = null!;

    public string? DisplayId { get; set; }

    public string Slug { get; set; } = null!;

    public string ProductName { get; set; } = null!;

    public string FkCategoryId { get; set; } = null!;

    public string? Description { get; set; }

    public decimal BasePrice { get; set; }

    public string? Material { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Category FkCategory { get; set; } = null!;

    public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();

    public virtual ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
