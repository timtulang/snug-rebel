using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PromoCodeController : ControllerBase
{
    private readonly AppDbContext _context;

    public PromoCodeController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPromoCodes()
    {
        try
        {
            var promoCodes = await _context.PromoCodes
                .OrderByDescending(p => p.PromoStart)
                .ToListAsync();

            return Ok(promoCodes);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== GET PROMO CODES CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPromoCodeById(string id)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest(new { error = "InvalidPromoCodeId", message = "The promoCodeId parameter cannot be null or empty." });

            var promoCode = await _context.PromoCodes.FirstOrDefaultAsync(p => p.PkPromoCodeId == id);
            if (promoCode == null)
                return NotFound(new { error = "PromoCodeNotFound", message = $"Promo code with ID '{id}' was not found." });

            return Ok(promoCode);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== GET PROMO CODE BY ID CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreatePromoCode([FromBody] PromoCode request)
    {
        try
        {
            if (request == null)
                return BadRequest(new { error = "NullRequestBody", message = "Request body cannot be null." });

            if (string.IsNullOrWhiteSpace(request.Promocode))
                return BadRequest(new { error = "InvalidPromoCode", message = "Promo code value is required." });

            if (request.DiscountValue <= 0)
                return BadRequest(new { error = "InvalidDiscountValue", message = "Discount value must be greater than zero." });

            _context.PromoCodes.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPromoCodeById), new { id = request.PkPromoCodeId }, request);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== CREATE PROMO CODE CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePromoCode(string id, [FromBody] PromoCode request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest(new { error = "InvalidPromoCodeId", message = "The promoCodeId parameter cannot be null or empty." });

            if (request == null)
                return BadRequest(new { error = "NullRequestBody", message = "Request body cannot be null." });

            var promoCode = await _context.PromoCodes.FirstOrDefaultAsync(p => p.PkPromoCodeId == id);
            if (promoCode == null)
                return NotFound(new { error = "PromoCodeNotFound", message = $"Promo code with ID '{id}' was not found." });

            promoCode.Promocode = request.Promocode;
            promoCode.Description = request.Description;
            promoCode.DiscountValue = request.DiscountValue;
            promoCode.MinOrderAmount = request.MinOrderAmount;
            promoCode.MaxUses = request.MaxUses;
            promoCode.PromoStart = request.PromoStart;
            promoCode.PromoEnd = request.PromoEnd;
            promoCode.IsActive = request.IsActive;

            await _context.SaveChangesAsync();
            return Ok(promoCode);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== UPDATE PROMO CODE CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePromoCode(string id)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest(new { error = "InvalidPromoCodeId", message = "The promoCodeId parameter cannot be null or empty." });

            var promoCode = await _context.PromoCodes.FirstOrDefaultAsync(p => p.PkPromoCodeId == id);
            if (promoCode == null)
                return NotFound(new { error = "PromoCodeNotFound", message = $"Promo code with ID '{id}' was not found." });

            _context.PromoCodes.Remove(promoCode);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Promo code '{id}' deleted successfully." });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== DELETE PROMO CODE CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }
}
