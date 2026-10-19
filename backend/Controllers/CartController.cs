using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using backend.DTO;
using backend.Models;
using backend.Data;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet("GetCartByUserId/{userId}")]
        public async Task<IActionResult> GetCartByUserId(string userId)
        {
            var cart = await _context.Carts
                .Where(c => c.FkUserId == userId)
                .Select(c => new CartDTO
                {
                    PkCartId = c.PkCartId,
                    Items = c.CartItems.Select(ci => new CartItemDTO
                    {
                        PkCartItemId = ci.PkCartItemId,
                        FkCartId = ci.FkCartId,
                        FkProductVariantId = ci.FkProductVariantId,
                        Quantity = ci.Quantity
                    }).ToList()
                })
                .ToListAsync();

            return Ok(cart);
        }
    }
}
