using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTO;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrderController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Order/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetOrdersByUserId(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { error = "InvalidUserId", message = "The userId parameter cannot be null or empty." });
            }

            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.FkUserId == userId)
                .OrderByDescending(o => o.PlacedAt)
                .ToListAsync();

            return Ok(orders.Select(MapToOrderDto).ToList());
        }

        // GET: api/Order/{orderId}
        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrderById(string orderId)
        {
            if (string.IsNullOrWhiteSpace(orderId))
            {
                return BadRequest(new { error = "InvalidOrderId", message = "The orderId parameter cannot be null or empty." });
            }

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.PkOrderId == orderId);

            if (order == null)
            {
                return NotFound(new { error = "OrderNotFound", message = $"Order with ID '{orderId}' was not found." });
            }

            return Ok(MapToOrderDto(order));
        }

        // POST: api/Order/checkout
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CreateOrderRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { error = "NullRequestBody", message = "Request body cannot be null." });
            }

            string? normalizedUserId = string.IsNullOrWhiteSpace(request.UserId) ? null : request.UserId.Trim();
            string? normalizedCartId = string.IsNullOrWhiteSpace(request.CartId) ? null : request.CartId.Trim();
            string? normalizedShippingAddressId = string.IsNullOrWhiteSpace(request.ShippingAddressId) ? null : request.ShippingAddressId.Trim();
            string? normalizedBillingAddressId = string.IsNullOrWhiteSpace(request.BillingAddressId) ? null : request.BillingAddressId.Trim();

            if (normalizedUserId == null)
            {
                return BadRequest(new { error = "InvalidUserId", message = "A valid UserId must be provided." });
            }

            if (normalizedShippingAddressId == null)
            {
                return BadRequest(new { error = "MissingShippingAddress", message = "A ShippingAddressId must be provided." });
            }

            if (request.ShippingFee < 0)
            {
                return BadRequest(new { error = "InvalidShippingFee", message = "ShippingFee cannot be negative." });
            }

            var userExists = await _context.Users.AnyAsync(u => u.PkUserId == normalizedUserId);
            if (!userExists)
            {
                return NotFound(new { error = "UserNotFound", message = $"User with ID '{normalizedUserId}' was not found." });
            }

            // Ensure both addresses belong to the user placing the order.
            var shippingAddress = await _context.Addresses
                .FirstOrDefaultAsync(a => a.PkAddressId == normalizedShippingAddressId && a.FkUserId == normalizedUserId);

            if (shippingAddress == null)
            {
                return NotFound(new { error = "ShippingAddressNotFound", message = "The shipping address was not found for this user." });
            }

            Address? billingAddress = null;
            if (normalizedBillingAddressId != null)
            {
                billingAddress = await _context.Addresses
                    .FirstOrDefaultAsync(a => a.PkAddressId == normalizedBillingAddressId && a.FkUserId == normalizedUserId);

                if (billingAddress == null)
                {
                    return NotFound(new { error = "BillingAddressNotFound", message = "The billing address was not found for this user." });
                }
            }

            // Load the user's cart items and the product variant details needed for order snapshots.
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.FkProductVariant)
                        .ThenInclude(pv => pv.FkProduct)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.FkProductVariant)
                        .ThenInclude(pv => pv.FkSize)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.FkProductVariant)
                        .ThenInclude(pv => pv.FkColor)
                .FirstOrDefaultAsync(c =>
                    c.FkUserId == normalizedUserId &&
                    (normalizedCartId == null || c.PkCartId == normalizedCartId));

            if (cart == null)
            {
                return NotFound(new { error = "CartNotFound", message = $"No cart was found for User ID '{normalizedUserId}'." });
            }

            if (!cart.CartItems.Any())
            {
                return BadRequest(new { error = "EmptyCart", message = "Cannot place an order because the cart is empty." });
            }

            // Validate quantities, active variants, and available stock before creating the order.
            foreach (var cartItem in cart.CartItems)
            {
                var variant = cartItem.FkProductVariant;

                if (cartItem.Quantity <= 0)
                {
                    return BadRequest(new { error = "InvalidQuantity", message = $"Cart item '{cartItem.PkCartItemId}' must have a quantity greater than zero." });
                }

                if (!variant.IsActive)
                {
                    return Conflict(new { error = "ProductVariantInactive", message = $"Product variant '{variant.PkProductVariantId}' is no longer available." });
                }

                if (variant.StockQuantity < cartItem.Quantity)
                {
                    return Conflict(new
                    {
                        error = "InsufficientStock",
                        message = $"Not enough stock for product variant '{variant.PkProductVariantId}'. Available: {variant.StockQuantity}, requested: {cartItem.Quantity}."
                    });
                }
            }

            var now = DateTime.UtcNow;
            var subtotal = cart.CartItems.Sum(ci =>
                (ci.FkProductVariant.PriceOverride ?? ci.FkProductVariant.FkProduct.BasePrice) * ci.Quantity);

            var order = new Order
            {
                OrderNumber = $"ORD-{now:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..8]}",
                FkUserId = normalizedUserId,
                FkPromoCodeId = null,
                FkShippingAddressId = shippingAddress.PkAddressId,
                FkBillingAddressId = billingAddress?.PkAddressId,
                Subtotal = subtotal,
                DiscountAmount = 0m,
                ShippingFee = request.ShippingFee,
                TotalAmount = subtotal + request.ShippingFee,
                CustomerNote = string.IsNullOrWhiteSpace(request.CustomerNote) ? null : request.CustomerNote.Trim(),
                PlacedAt = now,
                UpdatedAt = now
            };

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                var orderItems = new List<OrderItem>();
                foreach (var cartItem in cart.CartItems)
                {
                    var variant = cartItem.FkProductVariant;
                    var unitPrice = variant.PriceOverride ?? variant.FkProduct.BasePrice;

                    orderItems.Add(new OrderItem
                    {
                        FkOrderId = order.PkOrderId,
                        FkProductVariantId = variant.PkProductVariantId,
                        ProductName = variant.FkProduct.ProductName,
                        Sku = variant.Sku,
                        SizeLabel = variant.FkSize.Label,
                        ColorName = variant.FkColor.Name,
                        UnitPrice = unitPrice,
                        Quantity = cartItem.Quantity,
                        LineTotal = unitPrice * cartItem.Quantity,
                        FkProductVariant = variant
                    });

                    variant.StockQuantity -= cartItem.Quantity;
                }

                _context.OrderItems.AddRange(orderItems);
                _context.CartItems.RemoveRange(cart.CartItems);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                order.OrderItems = orderItems;
                return CreatedAtAction(nameof(GetOrderById), new { orderId = order.PkOrderId }, MapToOrderDto(order));
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // Helper method to safely map Entity to DTO in memory.
        private static OrderDTO MapToOrderDto(Order order)
        {
            return new OrderDTO
            {
                PkOrderId = order.PkOrderId,
                OrderNumber = order.OrderNumber,
                FkUserId = order.FkUserId,
                FkPromoCodeId = order.FkPromoCodeId,
                FkShippingAddressId = order.FkShippingAddressId,
                FkBillingAddressId = order.FkBillingAddressId,
                Subtotal = order.Subtotal,
                DiscountAmount = order.DiscountAmount,
                ShippingFee = order.ShippingFee,
                TotalAmount = order.TotalAmount,
                CustomerNote = order.CustomerNote,
                PlacedAt = order.PlacedAt,
                UpdatedAt = order.UpdatedAt,
                Items = order.OrderItems.Select(oi => new OrderItemDTO
                {
                    PkOrderItemId = oi.PkOrderItemId,
                    FkOrderId = oi.FkOrderId,
                    FkProductVariantId = oi.FkProductVariantId,
                    ProductName = oi.ProductName,
                    Sku = oi.Sku,
                    SizeLabel = oi.SizeLabel,
                    ColorName = oi.ColorName,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    LineTotal = oi.LineTotal
                }).ToList()
            };
        }
    }
}
