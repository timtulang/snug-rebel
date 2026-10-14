using System;
using backend.Models;

namespace backend.DTO;

public class ProductDTO
{
    public string? PkProductId { get; init; }
    public string? DisplayId { get; init; }
    public string? Slug { get; init; }
    public string? ProductName { get; init; }
    public string? FkCategoryId { get; init; }
    public string? BasePrice { get; init; }
    public bool isActive { get; init; }
    public virtual ICollection<ProductImageDTO>? ProductImages { get; init; }
}

public record CreateProductRequest(
    string DisplayId,
    string Slug,
    string ProductName,
    string FkCategoryId,
    string? Description,
    decimal BasePrice,
    string? Material,
    bool IsActive
);
