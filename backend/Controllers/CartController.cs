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

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetCartByUserId(string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId)) return BadRequest(new { error = "InvalidUserId", message = "The userId parameter cannot be null or empty." });

                var cart = await _context.Carts.Include(c => c.CartItems).FirstOrDefaultAsync(c => c.FkUserId == userId);
                if (cart == null) return NotFound(new { error = "CartNotFound", message = $"No active cart found for User ID '{userId}'." });

                return Ok(MapToCartDto(cart));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== GET CART BY USER CRASH ===\n{ex}");
                return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
            }
        }

        [HttpGet("session/{sessionToken}")]
        public async Task<IActionResult> GetCartBySessionId(string sessionToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(sessionToken)) return BadRequest(new { error = "InvalidSessionToken", message = "The sessionToken parameter cannot be null or empty." });

                var cart = await _context.Carts.Include(c => c.CartItems).FirstOrDefaultAsync(c => c.SessionToken == sessionToken);
                if (cart == null) return NotFound(new { error = "CartNotFound", message = $"No active cart found for Session Token '{sessionToken}'." });

                return Ok(MapToCartDto(cart));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== GET CART BY SESSION CRASH ===\n{ex}");
                return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
            }
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            try
            {
                if (request == null) return BadRequest(new { error = "NullRequestBody", message = "Request body cannot be null." });

                string? normalizedUserId = string.IsNullOrWhiteSpace(request.UserId) ? null : request.UserId;
                string? normalizedSessionToken = string.IsNullOrWhiteSpace(request.SessionToken) ? null : request.SessionToken;

                if (normalizedUserId == null && normalizedSessionToken == null)
                    return BadRequest(new { error = "MissingCartIdentifier", message = "At least one owner identifier must be provided." });

                var itemsToAdd = request.Items ?? new List<CartItemRequest>();
                if (!string.IsNullOrWhiteSpace(request.ProductVariantId))
                {
                    itemsToAdd.Add(new CartItemRequest { ProductVariantId = request.ProductVariantId, Quantity = request.Quantity ?? 1 });
                }

                var validItems = itemsToAdd.Where(i => i.Quantity > 0 && !string.IsNullOrWhiteSpace(i.ProductVariantId)).ToList();
                if (!validItems.Any()) return BadRequest(new { error = "NoValidItems", message = "At least one item with a valid ProductVariantId and quantity > 0 must be provided." });

                var requestedVariantIds = validItems.Select(i => i.ProductVariantId).Distinct().ToList();
                var existingVariantIds = await _context.ProductVariants.Where(pv => requestedVariantIds.Contains(pv.PkProductVariantId)).Select(pv => pv.PkProductVariantId).ToListAsync();

                var missingVariantIds = requestedVariantIds.Except(existingVariantIds).ToList();
                if (missingVariantIds.Any()) return NotFound(new { error = "ProductVariantsNotFound", message = $"ProductVariant IDs not found: {string.Join(", ", missingVariantIds)}" });

                var cart = await _context.Carts.Include(c => c.CartItems).FirstOrDefaultAsync(c => (normalizedUserId != null && c.FkUserId == normalizedUserId) || (normalizedSessionToken != null && c.SessionToken == normalizedSessionToken));

                if (cart == null)
                {
                    cart = new Cart { FkUserId = normalizedUserId, SessionToken = normalizedSessionToken, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                    _context.Carts.Add(cart);
                }
                else
                {
                    cart.UpdatedAt = DateTime.UtcNow;
                }

                foreach (var item in validItems)
                {
                    var existingItem = cart.CartItems.FirstOrDefault(ci => ci.FkProductVariantId == item.ProductVariantId);
                    if (existingItem != null)
                    {
                        existingItem.Quantity += item.Quantity;
                    }
                    else
                    {
                        cart.CartItems.Add(new CartItem { FkProductVariantId = item.ProductVariantId, Quantity = item.Quantity, AddedAt = DateTime.UtcNow });
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(MapToCartDto(cart));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== ADD TO CART CRASH ===\n{ex}");
                return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
            }
        }

        [HttpPut("item/{cartItemId}")]
        public async Task<IActionResult> UpdateItemQuantity(string cartItemId, [FromBody] UpdateCartItemRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(cartItemId)) return BadRequest(new { error = "InvalidCartItemId", message = "The cartItemId cannot be null or empty." });
                if (request == null) return BadRequest(new { error = "NullRequestBody", message = "Request body cannot be null." });

                var cartItem = await _context.CartItems.FindAsync(cartItemId);
                if (cartItem == null) return NotFound(new { error = "CartItemNotFound", message = $"Cart item '{cartItemId}' was not found." });

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
            catch (Exception ex)
            {
                Console.WriteLine($"=== UPDATE ITEM QUANTITY CRASH ===\n{ex}");
                return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
            }
        }

        [HttpDelete("item/{cartItemId}")]
        public async Task<IActionResult> RemoveCartItem(string cartItemId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(cartItemId)) return BadRequest(new { error = "InvalidCartItemId", message = "The cartItemId cannot be null or empty." });

                var cartItem = await _context.CartItems.FindAsync(cartItemId);
                if (cartItem == null) return NotFound(new { error = "CartItemNotFound", message = $"Cart item '{cartItemId}' was not found." });

                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Cart item '{cartItemId}' successfully removed." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== REMOVE CART ITEM CRASH ===\n{ex}");
                return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
            }
        }

        [HttpDelete("{cartId}/clear")]
        public async Task<IActionResult> ClearCart(string cartId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(cartId)) return BadRequest(new { error = "InvalidCartId", message = "The cartId cannot be null or empty." });

                var cartExists = await _context.Carts.AnyAsync(c => c.PkCartId == cartId);
                if (!cartExists) return NotFound(new { error = "CartNotFound", message = $"Cart with ID '{cartId}' does not exist." });

                var cartItems = await _context.CartItems.Where(ci => ci.FkCartId == cartId).ToListAsync();
                if (!cartItems.Any()) return Ok(new { message = $"Cart '{cartId}' is already empty." });

                _context.CartItems.RemoveRange(cartItems);
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Successfully cleared {cartItems.Count} item(s) from cart '{cartId}'." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== CLEAR CART CRASH ===\n{ex}");
                return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
            }
        }

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