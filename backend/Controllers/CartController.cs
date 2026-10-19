using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTO;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Cart/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetCartByUserId(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { error = "InvalidUserId", message = "The userId parameter cannot be null or empty." });
            }

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.FkUserId == userId);

            if (cart == null)
            {
                return NotFound(new { error = "CartNotFound", message = $"No active cart found for User ID '{userId}'." });
            }

            return Ok(MapToCartDto(cart));
        }

        // GET: api/Cart/session/{sessionToken}
        [HttpGet("session/{sessionToken}")]
        public async Task<IActionResult> GetCartBySessionId(string sessionToken)
        {
            if (string.IsNullOrWhiteSpace(sessionToken))
            {
                return BadRequest(new { error = "InvalidSessionToken", message = "The sessionToken parameter cannot be null or empty." });
            }

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.SessionToken == sessionToken);

            if (cart == null)
            {
                return NotFound(new { error = "CartNotFound", message = $"No active cart found for Session Token '{sessionToken}'." });
            }

            return Ok(MapToCartDto(cart));
        }

        // POST: api/Cart/add
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { error = "NullRequestBody", message = "Request body cannot be null." });
            }

            // Normalize owner identifiers
            string? normalizedUserId = string.IsNullOrWhiteSpace(request.UserId) ? null : request.UserId;
            string? normalizedSessionToken = string.IsNullOrWhiteSpace(request.SessionToken) ? null : request.SessionToken;

            if (normalizedUserId == null && normalizedSessionToken == null)
            {
                return BadRequest(new 
                { 
                    error = "MissingCartIdentifier", 
                    message = "At least one owner identifier (UserId or SessionToken) must be provided." 
                });
            }

            // 1. Consolidate single item and batch items into one unified list
            var itemsToAdd = request.Items ?? new List<CartItemRequest>();

            if (!string.IsNullOrWhiteSpace(request.ProductVariantId))
            {
                itemsToAdd.Add(new CartItemRequest
                {
                    ProductVariantId = request.ProductVariantId,
                    Quantity = request.Quantity ?? 1
                });
            }

            // Filter out invalid items
            var validItems = itemsToAdd
                .Where(i => i.Quantity > 0 && !string.IsNullOrWhiteSpace(i.ProductVariantId))
                .ToList();

            if (!validItems.Any())
            {
                return BadRequest(new 
                { 
                    error = "NoValidItems", 
                    message = "At least one item with a valid ProductVariantId and quantity > 0 must be provided." 
                });
            }

            // 2. Validate existence of all requested product variants in 1 database call
            var requestedVariantIds = validItems.Select(i => i.ProductVariantId).Distinct().ToList();
            var existingVariantIds = await _context.ProductVariants
                .Where(pv => requestedVariantIds.Contains(pv.PkProductVariantId))
                .Select(pv => pv.PkProductVariantId)
                .ToListAsync();

            var missingVariantIds = requestedVariantIds.Except(existingVariantIds).ToList();
            if (missingVariantIds.Any())
            {
                return NotFound(new 
                { 
                    error = "ProductVariantsNotFound", 
                    message = $"The following ProductVariant IDs do not exist: {string.Join(", ", missingVariantIds)}" 
                });
            }

            // 3. Detect if cart exists or create a new one
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => 
                    (normalizedUserId != null && c.FkUserId == normalizedUserId) ||
                    (normalizedSessionToken != null && c.SessionToken == normalizedSessionToken));

            if (cart == null)
            {
                cart = new Cart
                {
                    FkUserId = normalizedUserId,
                    SessionToken = normalizedSessionToken,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Carts.Add(cart);
            }
            else
            {
                cart.UpdatedAt = DateTime.UtcNow;
            }

            // 4. Upsert items into cart
            foreach (var item in validItems)
            {
                var existingItem = cart.CartItems
                    .FirstOrDefault(ci => ci.FkProductVariantId == item.ProductVariantId);

                if (existingItem != null)
                {
                    existingItem.Quantity += item.Quantity;
                }
                else
                {
                    var newItem = new CartItem
                    {
                        FkProductVariantId = item.ProductVariantId,
                        Quantity = item.Quantity,
                        AddedAt = DateTime.UtcNow
                    };
                    cart.CartItems.Add(newItem);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(MapToCartDto(cart));
        }

        // PUT: api/Cart/item/{cartItemId}
        [HttpPut("item/{cartItemId}")]
        public async Task<IActionResult> UpdateItemQuantity(string cartItemId, [FromBody] UpdateCartItemRequest request)
        {
            if (string.IsNullOrWhiteSpace(cartItemId))
            {
                return BadRequest(new { error = "InvalidCartItemId", message = "The cartItemId parameter cannot be null or empty." });
            }

            if (request == null)
            {
                return BadRequest(new { error = "NullRequestBody", message = "Request body cannot be null." });
            }

            var cartItem = await _context.CartItems.FindAsync(cartItemId);
            if (cartItem == null)
            {
                return NotFound(new { error = "CartItemNotFound", message = $"Cart item with ID '{cartItemId}' was not found." });
            }

            if (request.Quantity <= 0)
            {
                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();
                return Ok(new { message = $"Cart item '{cartItemId}' removed successfully." });
            }

            cartItem.Quantity = request.Quantity;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Cart item '{cartItemId}' quantity updated to {request.Quantity}." });
        }

        // DELETE: api/Cart/item/{cartItemId}
        [HttpDelete("item/{cartItemId}")]
        public async Task<IActionResult> RemoveCartItem(string cartItemId)
        {
            if (string.IsNullOrWhiteSpace(cartItemId))
            {
                return BadRequest(new { error = "InvalidCartItemId", message = "The cartItemId parameter cannot be null or empty." });
            }

            var cartItem = await _context.CartItems.FindAsync(cartItemId);
            if (cartItem == null)
            {
                return NotFound(new { error = "CartItemNotFound", message = $"Cart item with ID '{cartItemId}' was not found." });
            }

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Cart item '{cartItemId}' successfully removed." });
        }

        // DELETE: api/Cart/{cartId}/clear
        [HttpDelete("{cartId}/clear")]
        public async Task<IActionResult> ClearCart(string cartId)
        {
            if (string.IsNullOrWhiteSpace(cartId))
            {
                return BadRequest(new { error = "InvalidCartId", message = "The cartId parameter cannot be null or empty." });
            }

            var cartExists = await _context.Carts.AnyAsync(c => c.PkCartId == cartId);
            if (!cartExists)
            {
                return NotFound(new { error = "CartNotFound", message = $"Cart with ID '{cartId}' does not exist." });
            }

            var cartItems = await _context.CartItems
                .Where(ci => ci.FkCartId == cartId)
                .ToListAsync();

            if (!cartItems.Any())
            {
                return Ok(new { message = $"Cart '{cartId}' is already empty." });
            }

            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Successfully cleared {cartItems.Count} item(s) from cart '{cartId}'." });
        }

        // Helper method to safely map Entity to DTO in memory
        private static CartDTO MapToCartDto(Cart cart)
        {
            return new CartDTO
            {
                PkCartId = cart.PkCartId,
                FkUserId = cart.FkUserId,
                SessionToken = cart.SessionToken,
                Items = cart.CartItems.Select(ci => new CartItemDTO
                {
                    PkCartItemId = ci.PkCartItemId,
                    FkCartId = ci.FkCartId,
                    FkProductVariantId = ci.FkProductVariantId,
                    Quantity = ci.Quantity
                }).ToList()
            };
        }
    }
}