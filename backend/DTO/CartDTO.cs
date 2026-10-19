using System.Collections.Generic;
using System.Linq;

namespace backend.DTO;

public class CartDTO
{
    public string PkCartId { get; set; } = null!;
    public string? FkUserId { get; set; }
    public string? SessionToken { get; set; }
    public List<CartItemDTO> Items { get; set; } = new();
    public int TotalItems => Items?.Sum(i => i.Quantity) ?? 0;
}

public class CartItemDTO
{
    public string PkCartItemId { get; set; } = null!;
    public string FkCartId { get; set; } = null!;
    public string FkProductVariantId { get; set; } = null!;
    public int Quantity { get; set; }
}

public class CartItemRequest
{
    public string ProductVariantId { get; set; } = null!;
    public int Quantity { get; set; } = 1;
}

public class AddToCartRequest
{
    public string? UserId { get; set; }
    public string? SessionToken { get; set; }
    
    // Single item payload fields
    public string? ProductVariantId { get; set; }
    public int? Quantity { get; set; }

    // Multi-item payload list
    public List<CartItemRequest>? Items { get; set; }
}

public class UpdateCartItemRequest
{
    public int Quantity { get; set; }
}

public class MergeCartRequest
{
    public string SessionToken { get; set; } = null!;
    public string UserId { get; set; } = null!;
}