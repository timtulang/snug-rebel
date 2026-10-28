using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SizeController : ControllerBase
{
    private readonly AppDbContext _context;

    public SizeController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSizes()
    {
        try
        {
            var sizes = await _context.Sizes
                .OrderBy(s => s.SortOrder)
                .ThenBy(s => s.Label)
                .ToListAsync();

            return Ok(sizes);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== GET SIZES CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetSizeById(long id)
    {
        try
        {
            var size = await _context.Sizes.FirstOrDefaultAsync(s => s.PkSizeId == id);
            if (size == null)
                return NotFound(new { error = "SizeNotFound", message = $"Size with ID '{id}' was not found." });

            return Ok(size);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== GET SIZE BY ID CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateSize([FromBody] Size request)
    {
        try
        {
            if (request == null)
                return BadRequest(new { error = "NullRequestBody", message = "Request body cannot be null." });

            if (string.IsNullOrWhiteSpace(request.Label))
                return BadRequest(new { error = "InvalidSizeLabel", message = "Size label is required." });

            _context.Sizes.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSizeById), new { id = request.PkSizeId }, request);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== CREATE SIZE CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> UpdateSize(long id, [FromBody] Size request)
    {
        try
        {
            if (request == null)
                return BadRequest(new { error = "NullRequestBody", message = "Request body cannot be null." });

            var size = await _context.Sizes.FirstOrDefaultAsync(s => s.PkSizeId == id);
            if (size == null)
                return NotFound(new { error = "SizeNotFound", message = $"Size with ID '{id}' was not found." });

            size.Label = request.Label;
            size.SortOrder = request.SortOrder;

            await _context.SaveChangesAsync();
            return Ok(size);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== UPDATE SIZE CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteSize(long id)
    {
        try
        {
            var size = await _context.Sizes
                .Include(s => s.ProductVariants)
                .FirstOrDefaultAsync(s => s.PkSizeId == id);

            if (size == null)
                return NotFound(new { error = "SizeNotFound", message = $"Size with ID '{id}' was not found." });

            if (size.ProductVariants.Any())
                return Conflict(new { error = "SizeInUse", message = "This size cannot be deleted because it is assigned to one or more product variants." });

            _context.Sizes.Remove(size);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Size '{id}' deleted successfully." });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== DELETE SIZE CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }
}
