using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CollectionController : ControllerBase
{
    private readonly AppDbContext _context;

    public CollectionController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCollections()
    {
        try
        {
            var collections = await _context.Collections
                .OrderByDescending(c => c.LaunchDate)
                .ToListAsync();

            return Ok(collections);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== GET COLLECTIONS CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCollectionById(string id)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest(new { error = "InvalidCollectionId", message = "The collectionId parameter cannot be null or empty." });

            var collection = await _context.Collections
                .FirstOrDefaultAsync(c => c.PkCollectionId == id);

            if (collection == null)
                return NotFound(new { error = "CollectionNotFound", message = $"Collection with ID '{id}' was not found." });

            return Ok(collection);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== GET COLLECTION BY ID CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateCollection([FromBody] Collection request)
    {
        try
        {
            if (request == null)
                return BadRequest(new { error = "NullRequestBody", message = "Request body cannot be null." });

            if (string.IsNullOrWhiteSpace(request.CollectionName))
                return BadRequest(new { error = "InvalidCollectionName", message = "Collection name is required." });

            if (string.IsNullOrWhiteSpace(request.Slug))
                request.Slug = request.CollectionName.Trim();

            var exists = await _context.Collections.AnyAsync(c => c.Slug == request.Slug || c.CollectionName == request.CollectionName);
            if (exists)
                return Conflict(new { error = "CollectionExists", message = "A collection with the same name or slug already exists." });

            _context.Collections.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCollectionById), new { id = request.PkCollectionId }, request);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== CREATE COLLECTION CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCollection(string id, [FromBody] Collection request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest(new { error = "InvalidCollectionId", message = "The collectionId parameter cannot be null or empty." });

            if (request == null)
                return BadRequest(new { error = "NullRequestBody", message = "Request body cannot be null." });

            var collection = await _context.Collections.FirstOrDefaultAsync(c => c.PkCollectionId == id);
            if (collection == null)
                return NotFound(new { error = "CollectionNotFound", message = $"Collection with ID '{id}' was not found." });

            collection.CollectionName = request.CollectionName;
            collection.Slug = string.IsNullOrWhiteSpace(request.Slug) ? request.CollectionName.Trim() : request.Slug;
            collection.Description = request.Description;
            collection.BannerUrl = request.BannerUrl;
            collection.IsActive = request.IsActive;
            collection.LaunchDate = request.LaunchDate;

            await _context.SaveChangesAsync();
            return Ok(collection);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== UPDATE COLLECTION CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCollection(string id)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest(new { error = "InvalidCollectionId", message = "The collectionId parameter cannot be null or empty." });

            var collection = await _context.Collections.FirstOrDefaultAsync(c => c.PkCollectionId == id);
            if (collection == null)
                return NotFound(new { error = "CollectionNotFound", message = $"Collection with ID '{id}' was not found." });

            _context.Collections.Remove(collection);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Collection '{id}' deleted successfully." });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== DELETE COLLECTION CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }
}
