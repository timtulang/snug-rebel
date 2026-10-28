using backend.Data;
using backend.Models;
using backend.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("GetProducts")]
    public async Task<IActionResult> GetProducts()
    {
        try
        {
            var products = await _context.Products.ToListAsync();
            return Ok(products);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== GET PRODUCTS CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpGet("ProductList")]
    public async Task<IActionResult> ProductList()
    {
        try
        {
            var products = await _context.Products
                .Select(p => new ProductDTO
                {
                    PkProductId = p.PkProductId,
                    DisplayId = p.DisplayId,
                    Slug = p.Slug,
                    ProductName = p.ProductName,
                    FkCategoryId = p.FkCategoryId,
                    BasePrice = p.BasePrice.ToString("F2"),
                    isActive = p.IsActive,
                    ProductImages = p.ProductImages
                        .Where(img => img.IsPrimary)
                        .Select(img => new ProductImageDTO { Url = img.Url, AltText = img.AltText })
                        .ToList()
                })
            .ToListAsync();
            return Ok(products);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== PRODUCT LIST CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpGet("GetProductByID/{id}")]
    public async Task<IActionResult> GetProductById(string id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== GET PRODUCT BY ID CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpPost("CreateProduct")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        try
        {
            var product = new Product
            {
                DisplayId = request.DisplayId,
                Slug = request.Slug,
                ProductName = request.ProductName,
                FkCategoryId = request.FkCategoryId,
                Description = request.Description,
                BasePrice = request.BasePrice,
                Material = request.Material,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProductById), new { id = product.PkProductId }, product);
        }
        catch (DbUpdateException dbEx)
        {
            var dbError = dbEx.InnerException?.Message ?? dbEx.Message;
            Console.WriteLine($"=== CREATE PRODUCT DB CRASH ===\n{dbEx}");
            return StatusCode(500, new { error = "DatabaseUpdateFailed", details = dbError, stackTrace = dbEx.ToString() });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== CREATE PRODUCT CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpPut("UpdateProduct/{id}")]
    public async Task<IActionResult> UpdateProduct(string id, [FromBody] Product updatedProduct)
    {
        try
        {
            if (id != updatedProduct.PkProductId) return BadRequest("Product ID mismatch.");

            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null) return NotFound();

            existingProduct.DisplayId = updatedProduct.DisplayId;
            existingProduct.Slug = updatedProduct.Slug;
            existingProduct.ProductName = updatedProduct.ProductName;
            existingProduct.FkCategoryId = updatedProduct.FkCategoryId;
            existingProduct.Description = updatedProduct.Description;
            existingProduct.BasePrice = updatedProduct.BasePrice;
            existingProduct.Material = updatedProduct.Material;
            existingProduct.IsActive = updatedProduct.IsActive;
            existingProduct.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (DbUpdateException dbEx)
        {
            var dbError = dbEx.InnerException?.Message ?? dbEx.Message;
            Console.WriteLine($"=== UPDATE PRODUCT DB CRASH ===\n{dbEx}");
            return StatusCode(500, new { error = "DatabaseUpdateFailed", details = dbError, stackTrace = dbEx.ToString() });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== UPDATE PRODUCT CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }

    [HttpDelete("DeactivateProduct/{id}")]
    public async Task<IActionResult> DeactivateProduct(string id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.IsActive = false;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"=== DEACTIVATE PRODUCT CRASH ===\n{ex}");
            return StatusCode(500, new { error = "InternalServerError", message = ex.Message, stackTrace = ex.ToString() });
        }
    }
}