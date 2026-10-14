using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Order
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

    public virtual Address? FkBillingAddress { get; set; }

    public virtual PromoCode? FkPromoCode { get; set; }

    public virtual Address FkShippingAddress { get; set; } = null!;

    public virtual User FkUser { get; set; } = null!;

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<OrderStatusHistory> OrderStatusHistories { get; set; } = new List<OrderStatusHistory>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<Shipment> Shipments { get; set; } = new List<Shipment>();
}
