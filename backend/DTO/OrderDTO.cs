using System;
using System.Collections.Generic;

namespace backend.DTO
{
    public class CreateOrderRequest
    {
        public string? UserId { get; set; }
        public string? CartId { get; set; }
        public string? ShippingAddressId { get; set; }
        public string? BillingAddressId { get; set; }
        public decimal ShippingFee { get; set; }
        public string? CustomerNote { get; set; }
    }

    public class OrderDTO
    {
        public string PkOrderId { get; set; } = null!;
        public string OrderNumber { get; set; } = null!;
        public string FkUserId { get; set; } = null!;
        public string? FkPromoCodeId { get; set; }
        public string FkShippingAddressId { get; set; } = null!;
        public string? FkBillingAddressId { get; set; }
        public decimal Subtotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal TotalAmount { get; set; }
        public string? CustomerNote { get; set; }
        public DateTime PlacedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<OrderItemDTO> Items { get; set; } = new List<OrderItemDTO>();
    }

    public class OrderItemDTO
    {
        public string PkOrderItemId { get; set; } = null!;
        public string FkOrderId { get; set; } = null!;
        public string FkProductVariantId { get; set; } = null!;
        public string ProductName { get; set; } = null!;
        public string Sku { get; set; } = null!;
        public string SizeLabel { get; set; } = null!;
        public string ColorName { get; set; } = null!;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
    }
}
