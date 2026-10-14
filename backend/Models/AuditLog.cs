using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class AuditLog
{
    public string PkAuditLogId { get; set; } = null!;

    public string FkUserId { get; set; } = null!;

    public string Action { get; set; } = null!;

    public string? IpAddress { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User FkUser { get; set; } = null!;
}
