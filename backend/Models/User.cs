using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models;

public partial class User
{
    public string PkUserId { get; set; } = null!;

    public string UserEmail { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime? EmailVerifiedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    [JsonIgnore]
    public virtual ICollection<Address> Addresses { get; set; } = new List<Address>();

    [JsonIgnore]
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    [JsonIgnore]
    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();

    [JsonIgnore]
    public virtual ICollection<OrderStatusHistory> OrderStatusHistories { get; set; } = new List<OrderStatusHistory>();

    [JsonIgnore]
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    [JsonIgnore]
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
