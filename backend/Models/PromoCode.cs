using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class PromoCode
{
    public string PkPromoCodeId { get; set; } = null!;

    public string Promocode { get; set; } = null!;

    public string? Description { get; set; }

    public decimal DiscountValue { get; set; }

    public decimal? MinOrderAmount { get; set; }

    public int? MaxUses { get; set; }

    public int TimesUsed { get; set; }

    public DateTime? PromoStart { get; set; }

    public DateTime? PromoEnd { get; set; }

    public bool IsActive { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
