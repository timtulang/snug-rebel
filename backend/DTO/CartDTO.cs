using System;
using backend.Models;

namespace backend.DTO;

public class CartDTO
{
    public string? PkCartId { get; init; }
    public List<CartItemDTO>? Items { get; set; }

}

public class CartItemDTO
{
    public string? PkCartItemId { get; set; }
    public string? FkCartId { get; set; }
    public string? FkProductVariantId { get; set; }
    public int Quantity { get; set; }
}
