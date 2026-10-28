using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ColorController : ControllerBase
{
    private readonly AppDbContext _context;

    public ColorController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetColors()
    {
        try
        {
            var colors = await _context.Colors
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Ok(colors);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== GET COLORS CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetColorById(long id)
    {
        try
        {
            var color = await _context.Colors.FirstOrDefaultAsync(c => c.PkColorId == id);
            if (color == null)
                return NotFound(new { error = "ColorNotFound", message = $"Color with ID '{id}' was not found." });

            return Ok(color);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== GET COLOR BY ID CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateColor([FromBody] Color request)
    {
        try
        {
            if (request == null)
                return BadRequest(new { error = "NullRequestBody", message = "Request body cannot be null." });

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { error = "InvalidColorName", message = "Color name is required." });

            if (string.IsNullOrWhiteSpace(request.HexCode))
                return BadRequest(new { error = "InvalidHexCode", message = "Hex code is required." });

            _context.Colors.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetColorById), new { id = request.PkColorId }, request);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== CREATE COLOR CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> UpdateColor(long id, [FromBody] Color request)
    {
        try
        {
            if (request == null)
                return BadRequest(new { error = "NullRequestBody", message = "Request body cannot be null." });

            var color = await _context.Colors.FirstOrDefaultAsync(c => c.PkColorId == id);
            if (color == null)
                return NotFound(new { error = "ColorNotFound", message = $"Color with ID '{id}' was not found." });

            color.Name = request.Name;
            color.HexCode = request.HexCode;

            await _context.SaveChangesAsync();
            return Ok(color);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== UPDATE COLOR CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteColor(long id)
    {
        try
        {
            var color = await _context.Colors
                .Include(c => c.ProductVariants)
                .FirstOrDefaultAsync(c => c.PkColorId == id);

            if (color == null)
                return NotFound(new { error = "ColorNotFound", message = $"Color with ID '{id}' was not found." });

            if (color.ProductVariants.Any())
                return Conflict(new { error = "ColorInUse", message = "This color cannot be deleted because it is assigned to one or more product variants." });

            _context.Colors.Remove(color);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Color '{id}' deleted successfully." });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== DELETE COLOR CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }
}
