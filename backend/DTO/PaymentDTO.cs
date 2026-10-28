using backend.Models;

namespace backend.DTO;

public class ProcessPaymentRequest
{
    public string OrderId { get; set; } = null!;
    public PaymentMethod Method { get; set; }
    public string? ProviderReference { get; set; }
}
