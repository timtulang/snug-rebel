using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Category
{
    public string PkCategoryId { get; set; } = null!;

    public string? FkParentCategoryId { get; set; }

    public string CategoryName { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public virtual Category? FkParentCategory { get; set; }

    public virtual ICollection<Category> InverseFkParentCategory { get; set; } = new List<Category>();

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
