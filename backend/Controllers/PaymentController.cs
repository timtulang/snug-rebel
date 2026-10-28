using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTO;
using backend.Models;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PaymentController : ControllerBase
{
    private readonly AppDbContext _context;

    public PaymentController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentRequest request)
    {
        try
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.PkOrderId == request.OrderId);
            if (order == null) return NotFound(new { error = "OrderNotFound", message = "Order does not exist." });

            if (order.Status != OrderStatus.Pending)
                return BadRequest(new { error = "InvalidOrderStatus", message = $"Order cannot be paid. Current status: {order.Status}" });

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Create Payment Record
                var payment = new Payment
                {
                    FkOrderId = order.PkOrderId,
                    Method = request.Method,
                    Status = PaymentStatus.Paid,
                    Amount = order.TotalAmount,
                    ProviderReference = request.ProviderReference,
                    PaidAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Payments.Add(payment);

                // 2. Update Order Status
                order.Status = OrderStatus.Paid;
                order.UpdatedAt = DateTime.UtcNow;

                // 3. Log Status Change in History
                var history = new OrderStatusHistory
                {
                    FkOrderId = order.PkOrderId,
                    Status = OrderStatus.Paid,
                    ChangedBy = order.FkUserId, // The customer processing the payment
                    ChangedAt = DateTime.UtcNow
                };
                _context.OrderStatusHistories.Add(history);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Payment successful.", paymentId = payment.PkPaymentId, orderId = order.PkOrderId });
            }
            catch (Exception dbEx)
            {
                await transaction.RollbackAsync();
                throw dbEx; // Pass out to outer catch block
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== PAYMENT CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }
}