namespace backend.DTO;

public class CreateReviewRequest
{
    public string ProductId { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string OrderItemId { get; set; } = null!;
    public int Rating { get; set; }
    public string? Body { get; set; }
}

public class ReviewDTO
{
    public string PkReviewId { get; set; } = null!;
    public string FkProductId { get; set; } = null!;
    public string FkUserId { get; set; } = null!;
    public string FkOrderItemId { get; set; } = null!;
    public int Rating { get; set; }
    public string? Body { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? UserDisplayName { get; set; }
}
